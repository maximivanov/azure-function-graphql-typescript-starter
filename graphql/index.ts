import dotenv from 'dotenv'
dotenv.config() // load env vars before anything else

import { AzureFunction, Context } from '@azure/functions'
import { ApolloServer } from 'apollo-server-azure-functions'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { IpCityResolver } from './resolvers/IpCityResolver'
import { PostResolver } from './resolvers/PostResolver'
import { AppContext } from './util/azure'
import { getConnection } from './util/db'

let server: ApolloServer

const httpTrigger: AzureFunction = async function (context: Context) {
  if (server === undefined) {
    const conn = await getConnection()

    server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [IpCityResolver, PostResolver],
        validate: false,
      }),
      context: ({ context }): AppContext => {
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
