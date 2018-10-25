import { isValidAppIdOrLocator } from '@vtex/api'
import { ApolloError } from 'apollo-server-errors'
import { compose, flatten, keys, map, mapObjIndexed, partial, values, zipObj } from 'ramda'

import { appsWithSpecs, getSpec, getSpecs } from '../common/spec'

const maybeSpecsToSpecLocators = (maybeSpecs: Maybe<Specs>, appId: string) => maybeSpecs 
  ? compose(
    map((specName: string) => ({specName, appId})),
    keys
  )(maybeSpecs) as SpecLocator[]
  : [] 

export const specs = async (root, args: void, ctx: Context, info): Promise<SpecLocator[]> => {
  const {dataSources: {apps}} = ctx
  const appIdsWithStats = await appsWithSpecs(apps)
  const getSpecsForAppId = partial(getSpecs, [apps])
  const appSpecs = await Promise.map(appIdsWithStats, getSpecsForAppId)
  const specsByAppId = zipObj(appIdsWithStats, appSpecs)
  return compose(
    flatten,
    values,
    mapObjIndexed(maybeSpecsToSpecLocators)
  )(specsByAppId) as SpecLocator[]
}

interface SpecArgs {
  specName: string
  appId?: string
}

export const spec = async (root, args: SpecArgs, ctx: Context, info) => {
  const {dataSources: {apps}} = ctx
  const {specName, appId} = args

  if (appId && isValidAppIdOrLocator(appId)) {
    return getSpec(apps, appId, specName).then(JSON.stringify)
  } 
  
  throw new ApolloError(`Vega spec ${specName} was not found for app ${appId}`)
}
