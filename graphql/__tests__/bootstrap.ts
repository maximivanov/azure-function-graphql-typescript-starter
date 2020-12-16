import dotenv from 'dotenv'
dotenv.config() // loading env vars must happen first

import { getConnection } from '../util/db'

global.beforeEach(async () => {
  const conn = await getConnection()
  await conn.synchronize(true)
})

global.afterEach(() => {
  jest.clearAllMocks()
})

global.afterAll(async () => {
  const conn = await getConnection()
  await conn.close()
})
