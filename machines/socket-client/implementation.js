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
        `[Socket.IO] Client started connecting to ${context.endpoint}/${context.namespace}`
      ),
    logConnection: (context, event) =>
      console.log(
        `[Socket.IO] Socket has connected. Namespace: ${
          context.namespace || "default"
        }`
      ),
    logReconnecting: (context) =>
      console.log(
        `[Socket.IO] Socket is reconnecting. Namespace: ${
          context.namespace || "default"
        }`
      ),
    logDisconnection: (_, event) =>
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
    sendToInvoker: sendParent((_, event) => event),
  },
  services: {
    connectionListener: ({ socket }) => (send) => {
      socket.once("connect", (e) => {
        send({
          type: "SOCKET_CONNECTION",
          error: e,
        });
      });

      socket.once("connect_error", (e) => {
        send({
          type: "ERROR",
          error: e,
        });
      });

      socket.once("connect_timeout", (timeout) => {
        send({
          type: "ERROR",
          error: new Error(`ConnectionTimeout`),
        });
      });
    },
    disconnectionListener: ({ socket }) => (send) => {
      socket.once("disconnect", () => {
        send({
          type: "SOCKET_DISCONNECTION",
        });
      });
    },
    setupClient: (ctx) => (send) => {
      const { endpoint, namespace } = ctx;
      const connection_string = `${endpoint}/${namespace}`;

      console.log(`Connecting to ${connection_string}`);
      const socket = Client(connection_string);

      send({
        type: "CLIENT_CREATED",
        socket,
      });

      socket.on("error", (e) => {
        send({
          type: "ERROR",
          error: e,
        });
      });
    },
    listeners: (ctx) => (send) => {
      const { socket, events } = ctx;

      // socket.removeAllListeners();

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
