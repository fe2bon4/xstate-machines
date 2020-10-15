const { sendParent, assign, forwardTo } = require("xstate");
const Client = require("socket.io-client");

module.exports = {
  actions: {
    logExit: () => console.log(`[Socket.IO] Client is Exiting`),
    logError: (_, event) =>
      console.log(
        `[Socket.IO] Client error ${event.error.message}`,
        event.error.stack
      ),
    logEvent: (_, event) => console.log(`[Socket.IO]`, event),
    logInitializing: () => console.log(`[Socket.IO] Client Initializing`),
    logClientStarted: (context) =>
      console.log(
        `[Socket.IO] Client Started Listening to ${context.endpoint}/${context.namespace}`
      ),
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
    assignSocket: assign({ socket: (_, event) => event.socket }),
    emitEvent: (ctx, event) => {
      const { socket } = ctx;

      if (!event.event_name) {
        console.error("[Socket.IO] Emmit Error, event_name is required");
        return;
      }

      socket.emit(event.event_name, event.payload);
    },
  },
  services: {
    setupClient: (ctx) => (send) => {
      const { endpoint, namespace } = ctx;
      const connection_string = `${endpoint}/${namespace}`;

      console.log(`Connecting to ${connection_string}`);
      const socket = Client(connection_string);

      send({
        type: "CLIENT_CREATED",
        socket,
      });

      socket.once("connect", () => {
        send({
          type: "CLIENT_CONNECTED",
        });
      });

      socket.on("error", (e) => {
        send({
          type: "ERROR",
          error: e,
        });
      });

      socket.on("connect_error", (e) => {
        send({
          type: "ERROR",
          error: e,
        });
      });
    },
    listeners: (ctx) => (send) => {
      const { socket, events } = ctx;

      socket.removeAllListeners();

      socket.once("disconnect", () => {
        send({
          type: "SOCKET_DISCONNECTION",
        });
      });

      events.forEach((event_name) => {
        socket.on(event_name, (payload) => {
          console.log(`[Socket.IO] Listening for '${event_name}' event`);
          send({
            type: "SOCKET_EVENT",
            event_name,
            payload,
          });
        });
      });
    },
  },
};
