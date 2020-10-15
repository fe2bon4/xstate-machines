const { config, implementation } = require('../machines/kafka-consumer')

const { Machine, interpret } = require('xstate')

const machine = Machine( config, implementation )

const service = interpret( machine)


service.onEvent((e) => {
  if( e.type === 'TOPIC_MESSAGE')
  console.log( e )
})

service.onDone(() => {
  process.exit(0)
})

service.start()

