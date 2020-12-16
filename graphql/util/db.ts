import { createConnection, Connection } from 'typeorm'
import ormconfig from '../../ormconfig'

let connection: Connection

export async function getConnection(): Promise<Connection> {
  if (connection === undefined) {
    connection = await createConnection(
      <Parameters<typeof createConnection>[0]>ormconfig,
    )
  }

  return connection
}
