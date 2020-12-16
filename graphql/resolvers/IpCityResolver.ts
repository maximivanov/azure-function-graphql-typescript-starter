import { Arg, Query, Resolver } from 'type-graphql'
import { getIpInfo } from '../util/ipinfo'

@Resolver()
export class IpCityResolver {
  @Query(() => String)
  async ipCity(@Arg('ip') ip: string): Promise<string> {
    const ipInfo = await getIpInfo(ip)

    return ipInfo.city
  }
}
