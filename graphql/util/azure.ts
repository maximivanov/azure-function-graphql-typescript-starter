import { Context } from '@azure/functions'
import { Connection } from 'typeorm'

export type AppContext = {
  conn: Connection
  azureContext: Context
}
