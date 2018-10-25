import * as Bluebird from 'bluebird'

global.Promise = Bluebird

import { cache, dataSources } from './dataSources'
import { resolvers } from './resolvers'

export default {
  graphql: {
    cache,
    dataSources,
    resolvers,
  }
}