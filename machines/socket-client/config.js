module.exports = {
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
        },
        CLIENT_CONNECTED: {
          target: "connected",
        },
        ERROR: {
          actions: ["logError"],
        },
      },
    },
    connected: {
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
          actions: ["logError"],
        },
      },
    },
    exit: {
      type: "final",
    },
  },
};
