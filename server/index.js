const machine_name = process.argv[2] || "socket-server";

console.log(machine_name);

const { config, implementation } = require(`../machines/${machine_name}`);

const { Machine, interpret } = require("xstate");

const machine = Machine(config, implementation);

const service = interpret(machine);

// service.onEvent((e) => {});

service.onDone(() => {
  process.exit(0);
});

service.start();
