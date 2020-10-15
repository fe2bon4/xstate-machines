const { Kafka } = require("kafkajs");
const { assign, send:  sendAction } = require("xstate");

module.exports = {
  actions: {
    logError: (_, event) => console.error(`[kafkaProducer]: Error Occured`, event.error.message, '\n', event.error.stack),
    logInitializingState: () => console.log('[kafkaProducer]: Kafka Producer Initializing'),
    logRunningState: () => console.log('[kafkaProducer]: Kafka Producer Initiated'),
    logMessage: (context, event) => console.log(`[kafkaProducer]: Sending to [${event.topic || context.topic}]:`, event.messages),
    logMessageSent: (context, event) => console.log(`[kafkaProducer]: Sent to [${event.topic || context.topic}]:`, event.messages),
    sendToProducer: sendAction( (_,event) => event, {to: 'producer'}),
    assignKafkaInstance: assign({
      kafka: (_, event)=> event.kafka
    }),
    assignProducerInstance: assign({
      producer: (_, event)=> event.producer
    }),
  },
  services: {
    initializing: ( context ) => async(send) => {
      try {
        const { brokers, producer_id, config } = context
        const kafka = new Kafka( {
          brokers,
          clientId: producer_id
        })

        send({
          type: 'KAFKA_INITIALIZED',
          kafka
        })

        const producer = kafka.producer( config )

        send({
          type: 'PRODUCER_INITIALIZED',
          producer
        })

        await producer.connect()

        send({
          type: 'PRODUCER_CONNECTED',
          producer
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
    producer: ( context ) => (send, onEvent ) => {
      console.log(`[kafkaProducer] Producer Ready to send messages`)
      const { producer, topic: default_topic } = context

      const eventHandler = async ( event ) => {
        const { topic, messages } = event
        await producer.send({
          topic: topic || default_topic,
          messages
        })

        send({
          type: 'SENT_TO_TOPIC',
          event
        })
      }

      onEvent( eventHandler )
    }
  }
}