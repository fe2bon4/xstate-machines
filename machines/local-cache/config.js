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
