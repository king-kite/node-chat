const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const formatMessage = require("./utils/messages");
const {
	getCurrentUser,
	userLeave,
	getRoomUsers,
	userJoin,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);

const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Chat Socket Bot Name
const botName = "ChatSocket Bot";

// Run when client connects
io.on("connection", (socket) => {
	// Join specific room;
	socket.on("joinRoom", ({ username, room }) => {
		const user = userJoin(socket.id, username, room);

		socket.join(user.room);

		// Welcome current user
		// Send message to current user
		socket.emit("message", formatMessage(botName, "Welcome to ChatSocket!"));

		// Broadcast when a user connects
		// Send message to everyone except user
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				formatMessage(botName, `${username} has joined the chat!`)
			);

		// Send users and room info
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	// Listen for chatMessage
	socket.on("chatMessage", (message) => {
		const user = getCurrentUser(socket.id);
		if (user) {
			io.to(user.room).emit("message", formatMessage(user.username, message));
		}
	});

	// Runs when client disconnects
	socket.on("disconnect", () => {
		const user = userLeave(socket.id);

		if (user) {
			// Send message to everyone including user
			io.to(user.room).emit(
				"message",
				formatMessage(botName, `${user.username} has left the chat!`)
			);

			// Send users and room info
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
