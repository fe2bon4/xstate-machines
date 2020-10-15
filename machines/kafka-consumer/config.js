module.exports = {
  id: 'kafka-consumer',
  initial: 'initializing',
  context: {
    brokers: ['localhost:9092'],
    consumer_id: "machine-consumer",
    topic: 'default',
    consumer_config: {
      groupId: 'test-dddddd',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      metadataMaxAge: 300000,
      allowAutoTopicCreation: true,
      maxBytesPerPartition: 1048576, // (1MB),
      minBytes: 1,
      maxBytes: 10485760,  // (10MB),
      retry: 10,
      readUncommitted: false

    },
    run_config: {
      autoCommit: true,
      partitionsConsumedConcurrently: 1,
      rebalanceTimeout: 60000,
    },
    from_beginning: true,
    kafka: null,
    consumer: null
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
        CONSUMER_INITIALIZED: {
          actions: 'assignConsumerInstance'
        },
        CONSUMER_CONNECTED: 'running',
        ERROR: {
          actions: ['logError'],
          target: 'error'
        }
      }
    },
   
    running: {
      entry: ['logRunningState'],
      invoke: [
        {
          id: 'consumer',
          src: 'consumer'
        }
      ],
      initial: 'consuming', 
      states: {
        paused: {
          on: {
            RESUME: {
              actions: ['resumeConsumer'],
              target: 'consuming'
            }
          }
        },
        consuming: {
          on: {
            PAUSE: {
              actions: ['pauseConsumer'],
              target: 'paused'
            },
          }
        }
      },
      
      on: {
        TOPIC_MESSAGE: {
          actions: ['logMessage','sendToInvoker']
        },
        ERROR: 'error'
      }
    }
  }
}