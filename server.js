import http from "http";
import { Server } from "socket.io";

const httpServer = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok" }));
  }

  res.writeHead(200);
  res.end("Socket.IO server");
});

const allowedOrigins = [
  process.env.CLIENT_SITE_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CLIENT_URL,
].filter(Boolean);

console.log("CLIENT_URL:", process.env.CLIENT_URL);

console.log("Allowed origins:", allowedOrigins);


const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      console.log("Incoming origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  socket.on("task:created", (task) => {
    io.emit("task:created", task);
  });

  socket.on("task:updated", (task) => {
    io.emit("task:updated", task);
  });

  socket.on("task:deleted", ({ id }) => {
    io.emit("task:deleted", { id });
  });

  socket.on("project:created", (project) => {
    io.emit("project:created", project);
  });

  socket.on("project:updated", (project) => {
    io.emit("project:updated", project);
  });

  socket.on("project:deleted", ({ id }) => {
    io.emit("project:deleted", { id });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server for Express is running on ${PORT}`);
});






