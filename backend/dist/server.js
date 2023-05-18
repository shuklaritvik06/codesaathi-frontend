"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
let clients = {};
function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: clients[socketId]
        };
    });
}
io.sockets.on("connection", (socket) => {
    socket.on("join", ({ roomId, username }) => {
        if (clients[roomId] === undefined) {
            clients[roomId] = [
                {
                    [username]: socket.id
                }
            ];
        }
        else {
            let new_clients = clients[roomId].filter((user) => {
                return Object.keys(user)[0] !== username;
            });
            clients[roomId] = [
                ...new_clients,
                {
                    [username]: socket.id
                }
            ];
        }
        socket.join(roomId);
        const all_clients = getAllConnectedClients(roomId);
        all_clients.forEach(({ socketId }) => {
            io.to(socketId).emit("newjoined", {
                clients,
                username,
                socketId: socket.id
            });
        });
    });
    socket.on("chat", ({ room, username, message }) => {
        Object.keys(clients).forEach((roomID) => {
            if (roomID === room) {
                clients[room].forEach((client) => {
                    io.to(Object.values(client)).emit("newchat", {
                        msg: message,
                        username,
                        room
                    });
                });
            }
        });
    });
    socket.on("newcode", ({ roomId, code }) => {
        Object.keys(clients).forEach((room) => {
            if (room === roomId) {
                clients[room].forEach((client) => {
                    io.to(Object.values(client)).emit("codechange", {
                        code
                    });
                });
            }
        });
    });
    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit("disconnected", {
                socketId: socket.id,
                username: clients[socket.id]
            });
            socket.leave(roomId);
            Object.keys(clients).forEach((room) => {
                if (roomId === room) {
                    clients[room].forEach((client) => {
                        if (Object.values(client)[0] === socket.id) {
                            delete clients[room][Object.keys(client)[0]];
                        }
                    });
                }
            });
        });
    });
});
server.listen(5000, () => {
    console.log("listening on *:5000");
});
