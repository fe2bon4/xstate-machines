export interface Pinger {
  average_latency: number,
  current_latency: number,
  sequence: number,
  jitter: number,
  host: string
  buffer: any[]
  spawned: any
}


export const config  = {
  id: 'ping',
  initial: 'uninitialized',
  states: {
    uninitialized: {
      entry: ['logInitializing'],
      invoke: {
        src: 'initializeSpawn'
      },
      on: {
        INITIALIZED: {
          actions: ['assignSpawnedShell'],
          target: 'not_connected'
        }
      }
    },
    not_connected: {
      entry: ['logDisconnected'],
      invoke: {
        src: 'pingHost'
      },
      on: {
        PING: {
          actions: 'assignSequence',
          target: 'connected'
        }
      }
    },
    connected: {
      entry: ['logConnected'],
      invoke: {
        src: 'pingHost'
      },
      on: {
        PING: {
          actions: ['assignSequence','logPingEvent'],
          // target: 'connected'
        },
        DISCONNECTED: {
          target: 'not_connected'
        }
      }
    },
  }
}