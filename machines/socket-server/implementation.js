const { sendParent, assign, send: sendTo } = require("xstate");
const HTTP = require("http");
const Server = require("socket.io");

module.exports = {
  actions: {
    logExit: () => console.log(`[Socket.io] Server is Exiting`),
    logEvent: (_, event) => console.log(`[Socket.io]`, event),
    logInitializing: () => console.log(`[Socket.IO] Server Initializing`),
    logServerStarted: (context) =>
      console.log(`[Socket.IO] Server Started Listening on ${context.port}`),
    logConnection: (_, event) =>
      console.log(
        `[Socket.IO] Socket has connected. Namespace: ${
          event.namespace || "default"
        }`
      ),
    logDisonnection: (_, event) =>
      console.log(
        `[Socket.IO] Socket has disconnected. Namespace: ${
          event.namespace || "default"
        }`
      ),
    assignServer: assign({ server: (_, event) => event.server }),
    sendToInvoker: sendParent((_, event) => event),
    sendToEmmitters: sendTo((_, event) => event.payload, { to: "emmitters" }),
  },
  services: {
    setupServer: (ctx) => (send) => {
      const http = HTTP.createServer();

      http.on("listening", () => send("SERVER_LISTENING"));

      send({
        type: "SERVER_CREATED",
        server: Server(http),
      });

      http.listen(ctx.port);
    },
    listeners: (ctx) => (send) => {
      const { server, namespaces } = ctx;

      namespaces.forEach((namespace) => {
        server.of(`/${namespace}`).on("connection", (socket) => {
          send({
            type: "SOCKET_CONNECTION",
            namespace,
          });

          socket.on("disconnect", () => {
            send({
              type: "SOCKET_DISCONNECTION",
              namespace,
            });
          });

          socket.on("input_event", (payload) =>
            send({
              namespace,
              type: "SOCKET_EVENT",
              payload,
            })
          );
        });
      });

      server.on("connection", (socket) => {
        send({
          type: "SOCKET_CONNECTION",
          namespace: null,
        });

        socket.on("disconnect", () => {
          send({
            type: "SOCKET_DISCONNECTION",
            namespace: null,
          });
        });

        socket.on("input_event", (payload) =>
          send({
            namespace: null,
            type: "SOCKET_EVENT",
            payload,
          })
        );
      });
    },
    emmitters: (ctx) => (_, onEvent) => {
      const { server } = ctx;

      const namespaces = [...ctx.namespaces, "/"];

      // namespaces.forEach((name) => {
      //   const heartbeat_function = (updated_date) => {
      //     const namespace = name === "/" ? "" : name;

      //     server.of(`/${namespace}`).emit("heartbeat", {
      //       updated_date,
      //       from: namespace,
      //     });
      //   };
      //   setInterval(heartbeat_function, 2000, new Date().toISOString());
      // });

      onEvent((event) => {
        const { namespace = null, event_name = "change_event" } = event;

        if (!namespace) {
          console.log(event);
          server.of(`/`).emit(event_name, event.payload);
        } else {
          server.of(`/${namespace}`).emit(event_name, event.payload);
        }
      });
    },
  },
};
