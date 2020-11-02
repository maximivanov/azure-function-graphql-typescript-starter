import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Post } from '../entities/Post'
import { AppContext } from '../util/azure'

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(@Ctx() { conn }: AppContext): Promise<Post[]> {
    return await conn.getRepository(Post).find()
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Arg('description') description: string,
    @Ctx() { conn }: AppContext,
  ): Promise<Post> {
    const repo = conn.getRepository(Post)
    const post = repo.create()

    post.title = title
    post.description = description

    await repo.save(post)

    return post
  }
}
