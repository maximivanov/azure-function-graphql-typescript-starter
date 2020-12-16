import { invokeFunction } from '../util/azure'
import functionUnderTest from '../..'
import functionConfig from '../../function.json'
import { getConnection } from '../../util/db'
import { Post } from '../../entities/Post'

describe('PostResolver', () => {
  it('errors when required argument is missing', async () => {
    const res = await invokeFunction(
      functionUnderTest,
      functionConfig,
      `mutation {
        createPost(title: "My first post") {
          id
          title
        }
      }`,
    )

    expect(res.status).toEqual(400)
    expect(res.headers['Content-Type']).toEqual('application/json')

    const body = JSON.parse(res.body)
    expect(body.errors).toHaveLength(1)
    expect(body.errors[0].extensions.code).toEqual('GRAPHQL_VALIDATION_FAILED')
  })

  it('creates post', async () => {
    const title = 'My first post'
    const description = 'Summary of the post'

    const res = await invokeFunction(
      functionUnderTest,
      functionConfig,
      `mutation {
        createPost(title: "${title}", description: "${description}") {
          id
          title
        }
      }`,
    )

    const db = await getConnection()
    const post = await db.getRepository(Post).findOne()

    expect(post).toBeTruthy()
    expect(post!.title).toEqual(title)
    expect(post!.description).toEqual(description)

    expect(res.status).toEqual(200)
    expect(res.headers['Content-Type']).toEqual('application/json')

    const body = JSON.parse(res.body)
    expect(body.data.createPost.id).toEqual(post!.id)
    expect(body.data.createPost.title).toEqual(title)
  })

  it('fetches post', async () => {
    const db = await getConnection()
    const repo = db.getRepository(Post)

    const post = repo.create()
    post.title = 'First post'
    post.description = 'Post summary'
    await repo.save(post)

    const res = await invokeFunction(
      functionUnderTest,
      functionConfig,
      `query {
        post(id: ${post.id}) {
          id
          title
          description
        }
      }`,
    )

    expect(res.status).toEqual(200)
    expect(res.headers['Content-Type']).toEqual('application/json')

    const body = JSON.parse(res.body)
    expect(body.data.post.id).toEqual(post!.id)
    expect(body.data.post.title).toEqual(post!.title)
    expect(body.data.post.description).toEqual(post!.description)
  })
})
