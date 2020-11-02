import * as path from 'path'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

const envOverrides = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}

const config = Object.assign(
  {
    type: 'postgres',
    entities: [path.resolve(__dirname, 'graphql/entities/**')],
    migrations: [path.resolve(__dirname, 'graphql/migrations/**')],
    namingStrategy: new SnakeNamingStrategy(),
    logging: false,
    cli: {
      migrationsDir: 'graphql/migrations',
    },
    ssl: process.env.NODE_ENV === 'production',
  },
  envOverrides,
)

export = config
