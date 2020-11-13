import { BaseContext } from 'koa'
import {blacklistConnection } from '../providers/connections'
import { BlackList } from 'jwt-blacklist'
import * as errors from '../libraries/errors' 
import { logger } from '../libraries/logger'
import { config } from '../config'

let tokenBlacklist: BlackList | undefined

;(async () => { 
  if(config.redis.blackListEnabled)
    tokenBlacklist = tokenBlacklist || await blacklistConnection() 
})()

/**
 * Middleware to check if token has been revoked
 * 
 * @param  {BaseContext} context Koa context object
 * @param  {any} next Koa next() function
 * @returns {Promise<any>} a promise of the koa next() function
 */
export const tokenBlacklistMiddleware = async (context: BaseContext, next: any): Promise<any> => {
    if(!tokenBlacklist) {
      logger.error('tokenBlacklistMiddleware error: REDIS_NOT_CONNECTED')

      return next()
    }
    
    const token = (context.header?.authorization && context.header.authorization.split(' ')[1]) || ''

    if(tokenBlacklist && await tokenBlacklist.has(token))
      context.throw(new errors.RevokedToken())
    
    await next()
}
