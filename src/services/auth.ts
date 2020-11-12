import jwt from 'jsonwebtoken'
import { BaseContext } from 'koa'
import { config } from '../config'
import { User } from '../entities/user'
import { DecodedJwtToken } from '../interfaces/auth.interfaces'
import {blacklistConnection } from '../providers/connections'
import { BlackList } from 'jwt-blacklist'
import * as errors from '../libraries/errors'
import { logger } from '../libraries/logger'

/**
 * Signs a new jwt access token
 *
 * @param {{
 *  id: string
 *  email: string
 *  expiresIn: number
 * }} param0 - an object with params to sign the jwt token
 * @returns {string} the signed(encoded) jwt access token
 */
export const signAccessToken = function ({ id, email, expiresIn }: DecodedJwtToken): string {
    return jwt.sign({ id, email, expiresIn }, config.jwt.accessTokenSecret, {
        expiresIn: config.jwt.accessTokenLife,
    })
}

/**
 * Signs a new jwt refresh token
 *
 * @param  {string} email email of the user
 * @returns {string} the signed(encoded) jwt refresh token
 */
export const signRefreshToken = function (email: string): string {
    return jwt.sign({ email }, config.jwt.refreshTokenSecret, {
        expiresIn: config.jwt.refreshTokenLife,
    })
}

/**
 * Verifies the signature of a token
 *
 * @param  {BaseContext} context Koa Context object for error handling
 * @param  {string} token the token to be verified
 * @param  {string} type the type of token. Either 'access' or 'refresh'
 * @returns {DecodedJwtToken} the object that is the decoded jwt token
 */
export const verifyToken = function (context: BaseContext, token: string, type: string): DecodedJwtToken {
    const secret = type === 'access' ? config.jwt.accessTokenSecret : config.jwt.refreshTokenSecret
    const result = jwt.verify(token, secret, { ignoreExpiration: true })

    if (typeof result === 'string' || (result.constructor === Object && !result.hasOwnProperty('email')))
        context.throw(new errors.InvalidToken())

    return <DecodedJwtToken>result
}

/**
 *  Adds a token to the redis token blacklist
 * 
 * @param  {BaseContext} context Koa Context object
 * @returns {Promise<void>} a void promise
 */
export const revokeToken = async function(context: BaseContext): Promise<void> {
    const tokenToRevoke = (context.header?.authorization && context.header.authorization.split(' ')[1]) || ''

    try {
        const tokenBlacklist: BlackList = await blacklistConnection()

        await tokenBlacklist.add(tokenToRevoke)
    } catch(error) {
        logger.error('revokeToken', { error })
    }    
}   

/**
 *  Verifies the email contained in a JWT token
 *
 * @param  {BaseContext} context Koa Context object for error handling
 * @param  {User} user the user object
 */
export const verifyTokenEmail = function (context: BaseContext, user: User): void {
    if (context.state?.user?.email !== user.email) context.throw(new errors.UserPermissionDenied())
}

/**
 * Verifies if a user's token is valid
 *
 * @param  {BaseContext} context Koa Context object for error handling
 */
export const verifyUserLoggedIn = function (context: BaseContext): void {
    if (!context.state.user) context.throw(new errors.UserNotLoggedIn())
}
