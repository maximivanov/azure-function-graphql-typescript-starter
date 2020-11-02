import dotenv from 'dotenv'
dotenv.config() // load env vars before anything else

import { AzureFunction, Context } from '@azure/functions'
import { ApolloServer } from 'apollo-server-azure-functions'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import ormconfig from '../ormconfig'
import { PostResolver } from './resolvers/PostResolver'
import { AppContext } from './util/azure'

let server: ApolloServer

const httpTrigger: AzureFunction = async function (context: Context) {
  if (server === undefined) {
    const conn = await createConnection(
      <Parameters<typeof createConnection>[0]>ormconfig,
    )

    server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [PostResolver],
        validate: false,
      }),
      context: async ({ context }): Promise<AppContext> => {
        return {
          conn,
          azureContext: context,
        }
      },
    })
  }

  const apolloHandler = server.createHandler()

  return new Promise((resolve, reject) => {
    const originalDone = context.done

    context.done = (error, result) => {
      originalDone(error, result)

      if (error) {
        reject(error)
      }

      resolve(result)
    }

    apolloHandler(context, context.req!)
  })
}

export default httpTrigger
