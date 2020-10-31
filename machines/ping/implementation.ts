import { MachineOptions, assign } from 'xstate'
import { Pinger } from './config'
import { spawn as spawnShell } from 'child_process'
// import { assign } from 'xstate/lib/actions'

export interface PingEvent {
  type: 'PING',
  latency: number
  sequence: number
  ttl: number
}

export interface InitializeSpawnEvent {
  type: 'INITIALIZED',
  spawned: any
}


const prepend = ( message:string ) => `[Pinger]: ${message}`

export const implementation: MachineOptions<Pinger,any> = { 
  actions: {
    logInitializing: () => console.log(prepend('Initializing')),
    logDisconnected: () => console.log(prepend('Disconnected')),
    logConnected: () => console.log(prepend('Connected')),
    assignSequence: assign({
      sequence:  (contex, event) => event.sequence
    }),
    assignSpawnedShell: assign({
      spawned: (_, event ) => event.spawned
    }),
    logPingEvent: ({host}, {sequence,ttl, latency}:PingEvent) => console.log(prepend(`[${host}] Data: `), sequence, ttl, latency)
    // (context: Pinger,event:InitializeSpawnEvent) => context.spawned = event.spawned
  },
  activities: {},
  delays: {},
  guards: {},
  services: {
    initializeSpawn: ({host}) => (send) => {
      const spawned = spawnShell('ping',[host])
      spawned.stdout.setEncoding('utf-8')
      spawned.stderr.setEncoding('utf-8')
      send({
        type: 'INITIALIZED',
        spawned
      })
    },
    pingHost: ({host, spawned }) => (send) => {

      const outputHandler = (data: string) => {
   
      const dat = data.replace(/\n/g,'').split(' ')
      // @ts-ignore
      const sequence=parseInt( dat[4].split(/=/).pop() )

      // @ts-ignore
      const ttl=parseInt(dat[5].split(/=/).pop())

      // @ts-ignore
      const latency=parseInt(dat[6].split(/=/).pop())

        // @ts-ignore
      if( isNaN(sequence) )return

      const ping_event: PingEvent = {
        type: "PING",
        latency,
        sequence, 
        ttl
      }

      send( ping_event ) 
    }

      spawned?.stdout?.on('data', outputHandler )

      const errHandler = (data: string) => {
        console.log(prepend(`[${host}] Error: `), data)
      }

      spawned?.stderr?.on('data', errHandler )

      return () => {
        spawned?.stdout?.removeListener('data',outputHandler)
        spawned?.stderr?.removeListener('data',errHandler)
      }
    }  
  }
} 