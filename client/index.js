const io = require("socket.io-client");

const socket = io("http://localhost:3030/");

socket.on("heartbeat", (payload) => {
  console.log(
    `[Socket.io] Heartbeat from ${payload.from} at ${
      payload.updated_date
    } recieved at ${new Date().toISOString()}`
  );
});

socket.on("disconnect", () => {
  console.log("[Socket.io] Socket has disconnected from Server");
});

socket.on("connect", () => {
  console.log(`[Socket.io] Socket has connected to Server`);
});
