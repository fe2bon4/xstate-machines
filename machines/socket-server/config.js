const { PORT = 3030 } = process.env;

module.exports = {
  id: "socketio-server",
  context: {
    namespaces: ["namespace-1"],
    port: PORT,
    server: null,
  },
  initial: "initializing",
  states: {
    initializing: {
      entry: ["logInitializing"],
      invoke: {
        id: "setupServer",
        src: "setupServer",
      },
      on: {
        SERVER_CREATED: {
          actions: ["assignServer"],
        },
        SERVER_LISTENING: {
          target: "started",
        },
      },
    },
    started: {
      entry: ["logServerStarted"],
      invoke: [
        {
          id: "listeners",
          src: "listeners",
        },
        {
          id: "emmitters",
          src: "emmitters",
        },
      ],
      on: {
        EXTERNAL_EVENT: {
          actions: ["sendToEmmitters"],
        },
        SOCKET_CONNECTION: {
          actions: ["logConnection"],
        },
        SOCKET_DISCONNECTION: {
          actions: ["logDisonnection"],
        },
        SOCKET_EVENT: {
          actions: ["logEvent", "sendToInvoker"],
        },
        ERROR: {
          target: "exit",
          actions: ["logExit"],
        },
      },
    },
    exit: {
      type: "final",
    },
  },
};
