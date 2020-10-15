const { sendParent } = require("xstate");
const { omit } = require("lodash");
module.exports = {
  actions: {
    logReady: () => console.log(`[LocalCache] Ready for requests`),
    logRequest: (_, event) =>
      console.log(`[LocalCache] ${event.type}, ${event.key} ${event.payload}`),
    setKey: sendParent((context, event) => {
      const { key, payload } = event;

      context.data[key] = payload;
      return {
        type: "SET_KEY_DONE",
        key,
        value,
      };
    }),
    getKey: sendParent((context, event) => {
      const { key } = event;

      return {
        type: "GET_KEY_DONE",
        key,
        value: context.data[key] || null,
      };
    }),
    deleteKey: sendParent((context, event) => {
      const { key } = event;

      context.data = omit(context.data, [key]);

      return {
        type: "DELETE_KEY_DONE",
        key,
      };
    }),
  },
  services: {
    listeners: () => (send) => {
      setInterval(() => {}, 30000);
    },
  },
};
