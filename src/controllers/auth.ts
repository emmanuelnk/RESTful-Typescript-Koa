import _ from 'lodash'
import jwt from 'jsonwebtoken'
import { BaseContext } from 'koa'
import { request, summary, description, responses, tagsAll, body } from 'koa-swagger-decorator'
import { config } from '../config'
import { User } from '../entities/user'
import { createUserSchema } from '../entities/user.schema'
import * as AuthService from '../services/auth'
import * as UserService from '../services/user'
import * as ValidationService from '../services/validate'
import { response } from '../libraries/helpers'

@tagsAll(['Auth'])
export default class AuthController {
    @request('post', '/login')
    @summary('Log a user in')
    @body(_.pick(createUserSchema, ['email', 'password']))
    @responses({
        200: { description: 'successfully logged in' },
        400: { description: 'missing fields' },
        401: { description: 'unauthorized, missing/invalid jwt token, wrong password' },
        404: { description: 'user not found' },
    })
    public static async loginUser(context: BaseContext): Promise<void> {
        ValidationService.validateRequiredProperties(context, context.request.body, ['email', 'password'])

        const user = <User> await UserService.findUser(context, { where: { email: context.request.body.email } }, false)

        await UserService.checkIfUserPasswordCorrect(context, user)

        user.refreshToken = AuthService.signRefreshToken(user.email)

        await UserService.updateUser(context, user)

        const accessToken = AuthService.signAccessToken({ id: user._id, email: user.email })

        response(context, 200, { token: accessToken })
    }

    @request('get', '/refresh')
    @summary('Get the refresh token')
    @description('The user must already be authorized to used this route to get the refresh token')
    @responses({
        200: { description: 'still valid access token, successfully refreshed token' },
        400: { description: 'missing fields' },
        403: { description: 'unauthorized, missing/invalid jwt token' },
        404: { description: 'user not found' },
    })
    public static async refreshToken(context: BaseContext): Promise<void> {
        const token = (context.header?.authorization && context.header.authorization.split(' ')[1]) || ''
        const decoded = AuthService.verifyToken(context, token, 'access')

        // Send back the jwt token in the response if it is not yet expired
        if (!ValidationService.isExpired(decoded.exp))
            return response(context, 200, {
                token: jwt.sign(decoded, config.jwt.accessTokenSecret)
            })

        const user = <User> await UserService.findUser(context, { where: { email: decoded.email } }, false)

        AuthService.verifyToken(context, user.refreshToken || 'aaaaa', 'refresh')

        response(context, 200, {
            token: AuthService.signAccessToken({
                id: user._id,
                email: user.email,
                expiresIn: config.jwt.accessTokenLife,
            })
        })
    }

    @request('get', '/logout')
    @summary('Log a user out')
    @responses({
        200: { description: 'user successfully logged out' },
        400: { description: 'missing fields' },
        401: { description: 'invalid access token, user not logged in' },
        404: { description: 'user not found' },
    })
    public static async logoutUser(context: BaseContext): Promise<void> {
        AuthService.verifyUserLoggedIn(context)

        const user = <User> await UserService.findUser(context, { where: { email: context.state.user.email } }, false)

        user.refreshToken = 'removed'

        if(config.redis.blackListEnabled) await AuthService.revokeToken(context)
        
        await UserService.updateUser(context, user)

        response(context, 200)
    }
}
