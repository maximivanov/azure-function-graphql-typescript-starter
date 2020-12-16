import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql'
import { Post } from '../entities/Post'
import { AppContext } from '../util/azure'

@Resolver()
export class PostResolver {
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

  @Query(() => [Post])
  async posts(@Ctx() { conn }: AppContext): Promise<Post[]> {
    return conn.getRepository(Post).find()
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg('id', () => Int) id: number,
    @Ctx() ctx: AppContext,
  ): Promise<Post | undefined> {
    return ctx.conn.getRepository(Post).findOne(id)
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { conn }: AppContext,
  ): Promise<boolean> {
    const repo = conn.getRepository(Post)
    await repo.delete({ id })

    return true
  }
}
