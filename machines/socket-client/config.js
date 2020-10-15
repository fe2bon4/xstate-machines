const config = {
  id: "socketio-client",
  context: {
    namespace: "namespace-1",
    events: ["heartbeat", "change_event"],
    endpoint: "http://localhost:3030",
    socket: null,
  },
  initial: "initializing",
  states: {
    initializing: {
      entry: ["logInitializing"],
      invoke: {
        id: "setupClient",
        src: "setupClient",
      },
      on: {
        CLIENT_CREATED: {
          actions: ["assignSocket"],
          target: "running",
        },
        ERROR: {
          actions: ["logError"],
        },
      },
    },
    running: {
      initial: "disconnected",
      states: {
        connected: {
          invoke: {
            id: "disconnectionListener",
            src: "disconnectionListener",
          },
          on: {
            SOCKET_DISCONNECTION: {
              actions: ["logDisconnection"],
              target: "disconnected",
            },
          },
        },
        disconnected: {
          invoke: {
            id: "connectionListener",
            src: "connectionListener",
          },
          on: {
            SOCKET_CONNECTION: {
              actions: ["logConnection"],
              target: "connected",
            },
          },
        },
      },
      entry: ["logClientStarted"],
      invoke: [
        {
          id: "listeners",
          src: "listeners",
        },
      ],
      on: {
        EXTERNAL_EVENT: {
          actions: ["emitEvent"],
        },
        SOCKET_EVENT: {
          actions: ["logEvent", "sendToInvoker"],
        },
        ERROR: {
          actions: ["logError"],
        },
      },
    },
  },
};

module.exports = config;
