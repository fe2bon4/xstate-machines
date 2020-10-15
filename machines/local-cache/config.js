const config = {
  id: "local-cache",
  initial: "initializing",
  context: {
    data: {},
  },
  states: {
    initializing: {
      after: {
        2000: "ready",
      },
    },
    ready: {
      entry: ["logReady"],
      invoke: {
        id: "listeners",
        src: "listeners",
      },
      on: {
        SET_KEY: {
          actions: ["logRequest", "setKey"],
        },
        GET_KEY: {
          actions: ["logRequest", "getKey"],
        },
        DELETE_KEY: {
          actions: ["logRequest", "deleteKey"],
        },
      },
    },
  },
};

module.exports = config;
