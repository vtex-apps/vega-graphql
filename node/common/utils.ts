import { SPEC_PATH } from './globals'

export const cacheKey = (app: string) => `${app}/${SPEC_PATH}`.replace(/\W/g, '_')

export const toString = ({data}: {data: Buffer}) => data.toString()

