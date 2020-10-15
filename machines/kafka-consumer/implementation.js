const { Kafka } = require("kafkajs");
const { assign, sendParent } = require("xstate");

module.exports = {
  actions: {
    logError: (_, event) => console.error(`[kafkaConsumer]: Error Occured`, event.error.message, '\n', event.error.stack),
    logTopicToSubscribe: (_,event) => console.log(`[kafkaConsumer]: Subscribing to ${event.topic}`),
    logInitializingState: () => console.log('[kafkaConsumer]: Kafka Consumer Initializing'),
    logRunningState: () => console.log('[kafkaConsumer]: Kafka Consumer Initiated'),
    logMessage: (context, event) => console.log(`[kafkaConsumer]: Consuming from [${event.topic || context.topic}]:`, event.message),
    pauseConsumer: ( context ) => {
      context.consumer.pause()
      console.log(`[kafkaConsumer]: Consumer Paused`)
    },
    resumeConsumer: ( context ) => {
      context.consumer.resume()
      console.log(`[kafkaConsumer]: Consumer Resume`)
    },
    sendToInvoker: sendParent( (_,event) => event),
    assignKafkaInstance: assign({
      kafka: (_, event)=> event.kafka
    }),
    assignConsumerInstance: assign({
      consumer: (_, event)=> event.consumer
    }),
  },
  services: {
    initializing: ( context ) => async(send) => {
      try {
        const { brokers, consumer_id, consumer_config } = context
        const kafka = new Kafka( {
          brokers,
          clientId: consumer_id
        })

        send({
          type: 'KAFKA_INITIALIZED',
          kafka
        })

        const consumer = kafka.consumer( consumer_config )

        send({
          type: 'CONSUMER_INITIALIZED',
          consumer
        })

        await consumer.connect()

        send({
          type: 'CONSUMER_CONNECTED',
          consumer
        })

        
      } catch (e ) {
        send({
          type: 'ERROR',
          error: {
            stack: e.stack,
            message: e.message
          }
        })
      } 
      
    },
    consumer: ( context ) => (send ) => {
      console.log(`[kafkaConsumer] Consumer Ready to recieve messages`)
      const { consumer, run_config, from_beginning, topic } = context

      consumer.subscribe({ topic: topic, fromBeginning: from_beginning})

      const eachMessageHandler = async ( { topic, partition, message} ) => {
          send( {
            type: 'TOPIC_MESSAGE',
            topic,
            message,
            partition
          })
      }

      consumer.run({
        ...run_config,
        eachMessage: eachMessageHandler
      })
    }
  }
}