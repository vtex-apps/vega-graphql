import { Apps, DiskCache, LRUCache, MultilayeredCache, removeBuild } from '@vtex/api'
import { find, keys, prop } from 'ramda'

import { CACHE_PATH, SPEC_PATH, VEGA_GRAPHQL } from './globals'
import { ignoreNotFound } from './notFound'
import { cacheKey, toString } from './utils'

const specStorage = new MultilayeredCache<string, Maybe<Specs>>([
  new LRUCache({
    max: 100
  }),
  new DiskCache(CACHE_PATH)
])

const equalsNoBuild = (appIdNoBuild: string) => (appId: string) => removeBuild(appIdNoBuild) === removeBuild(appId)

const findAppInDeps = (apps: Apps, appIdNoBuild: string): Promise<Maybe<string>> => 
  apps.getDependencies()
  .then(keys)
  .then(find(equalsNoBuild(appIdNoBuild)))

const fetchSpec = (apps: Apps, appId: string) => (): Promise<Maybe<Specs>> => 
  apps.getAppFile(appId, SPEC_PATH)
  .then(toString)
  .then(JSON.parse)
  .catch(ignoreNotFound(null))

export const getSpecs = async (apps: Apps, appId: string) => {
  const appIdWithBuild = await findAppInDeps(apps, removeBuild(appId))
  return appIdWithBuild && specStorage.get(cacheKey(appIdWithBuild), fetchSpec(apps, appIdWithBuild))
}

export const getSpec = (apps: Apps, appId: string, specName: string): Promise<string> => 
  getSpecs(apps, appId).then(prop(specName))

export const appsWithSpecs = (apps: Apps) => apps.getDependencies(VEGA_GRAPHQL).then(keys)