import { Apps, DiskCache, LRUCache, MultilayeredCache } from '@vtex/api'

import { CACHE_PATH } from '../common/globals'

const cacheStorage = new MultilayeredCache([
  new LRUCache<string, any>({
    max: 1000
  }),
  new DiskCache(CACHE_PATH)
])

export const dataSources = () => ({
  apps: new Apps(),
})

export const cache = () => cacheStorage