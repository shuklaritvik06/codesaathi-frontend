import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
const server = createServer(app);
const io = new Server(server);
let clients: any = {};
type Users = {
  [username: string]: string;
};
function getAllConnectedClients(roomId: string) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: clients[socketId]
      };
    }
  );
}
io.sockets.on("connection", (socket) => {
  socket.on("join", ({ roomId, username }) => {
    if (clients[roomId] === undefined) {
      clients[roomId] = [
        {
          [username]: socket.id
        }
      ];
    } else {
      let new_clients = clients[roomId].filter((user: Array<Users>) => {
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
        clients[room].forEach((client: Object) => {
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
        clients[room].forEach((client: Object) => {
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
          clients[room].forEach((client: Object) => {
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
