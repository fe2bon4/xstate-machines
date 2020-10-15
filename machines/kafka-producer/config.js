module.exports = {
  id: 'kafka-producer',
  initial: 'initializing',
  context: {
    brokers: ['localhost:9092'],
    producer_id: "machine-producer",
    topic: 'default',
    config: {
      metadataMaxAge: 300000,
      allowAutoTopicCreation: true,
      transactionTimeout: 60000,
      maxInFlightRequests: null
    },
    kafka: null,
    producer: null
  },
  states: {
    error: {
      type: 'final'
    },
    initializing: {
      entry: 'logInitializingState',
      invoke: {
        id: 'initializing',
        src: 'initializing'
      },
      on: {
        KAFKA_INITIALIZED: {
          actions: 'assignKafkaInstance'
        },
        PRODUCER_INITIALIZED: {
          actions: 'assignProducerInstance'
        },
        PRODUCER_CONNECTED: 'running',
        ERROR: {
          actions: ['logError'],
          target: 'error'
        }
      }
    },
    running: {
      entry: 'logRunningState',
      invoke: [
        {
          id: 'producer',
          src: 'producer'
        }
      ],
      on: {
        SEND_TO_TOPIC: {
          actions: ['logMessage','sendToProducer']
        },
        SENT_TO_TOPIC: {
          actions: ['logMessageSent']
        },
        ERROR: 'error'
      }
    }
  }
}