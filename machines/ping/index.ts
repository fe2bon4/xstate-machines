import { Machine } from 'xstate'
import { config, Pinger } from './config'
import { implementation } from './implementation'


export const spawnMachine= ( context: Pinger ) => {
  return Machine( {...config, context}, implementation)
}

export default [ config, implementation]