const search = window.location.search;

// A Function to get values from search params
function getValueFromSearch(regex, defaultValue = "anonymous") {
	if (!search) return defaultValue;
	const regexValue = search.match(regex);
	if (!regexValue) return defaultValue;

	const splitValue = regexValue[0].split("=");
	if (splitValue.length < 1) return defaultValue; 
	const value = splitValue[splitValue.length - 1];
	return value || defaultValue
}

// Get username and room from URL
const username = getValueFromSearch(/username=[a-zA-Z]+/)
const room = getValueFromSearch(/room=[a-zA-Z#]+/)
const userList = document.querySelector('#users');

// Get the chat form
const chatForm = document.querySelector('#chat-form');

// Get the chat container
const chatMessages = document.querySelector('.chat-messages');

const socket = io();

// Join Chat Room
socket.emit('joinRoom', { username, room })

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
	outputRoomName(room);
	outputUsers(users);
})

// Message from server
socket.on('message', data => {
	outputMessage(data)

	// Scroll Down the chat form
	chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Message submit
chatForm.addEventListener('submit', (e) => {
	e.preventDefault();

	// Get message from the form
	const message = e.target.elements.msg.value;

	// Emit message to server
	socket.emit('chatMessage', message)

	// Clear Input
	e.target.elements.msg.value = '';
	e.target.elements.msg.focus();
})

// Output message to DOM
function outputMessage({ message, time, username }) {
	// Add new message to the chat container
	chatMessages.innerHTML += `
		<div class="message">
			<p class="meta">${username} <span>${time}</span></p>
			<p class="text">
				${message}
			</p>
		</div>
	`
}

// Change the room name
function outputRoomName(room) {
	document.querySelector('#room-name').innerText = room
}

// Add users to DOM
function outputUsers(users) {
	userList.innerHTML = `
		${users.map(user => `<li>${user.username}</li>`).join('')}
	`
}