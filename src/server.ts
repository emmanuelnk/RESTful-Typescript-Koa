import Koa from 'koa'
import jwt from 'koa-jwt'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import cors from '@koa/cors'
import winston from 'winston'
import 'reflect-metadata'
import { Server } from 'http'
import { loggerMiddleware } from './middleware/logger'
import { config } from './config'
import { rateLimiter } from './middleware/rate-limiter'
import { tokenBlacklistMiddleware } from './middleware/token-blacklist'
import { setupConnection } from './providers/connections'
import { unprotectedRouter } from './routes/unprotected'
import { protectedRouter } from './routes/protected'
import { staticRouter } from './routes/static'
import { logger } from './libraries/logger'

export const server = function (): Server {
    const app = new Koa()

    // Provides important security headers to make your app more secure
    app.use(helmet())

    // Enable cors with default options
    app.use(cors())

    // Logger middleware -> use winston as logger
    if(config.nodeEnv !== 'test') app.use(loggerMiddleware(winston))

    // Enable bodyParser with default options
    app.use(bodyParser())

    // Enable an in-memory (or redis) rate limiter
    app.use(rateLimiter)

    // these routes are NOT protected by the JWT middleware
    app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods())
    app.use(staticRouter.routes()).use(staticRouter.allowedMethods())

    // JWT middleware -> below this line routes are only reached if JWT token is valid
    app.use(jwt({ secret: config.jwt.accessTokenSecret }).unless({ path: [/^\/assets|swagger-/] }))

    // Middleware to block expired or revoked jwt tokens
    if(config.redis.blackListEnabled) app.use(tokenBlacklistMiddleware)

    // These routes are protected by the JWT middleware
    app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods())

    console.log(`Server running on port ${config.port}`)

    return app.listen(config.port)
}

// create connection with database
if(config.nodeEnv !== 'test')
    setupConnection(config.databaseUrl)
        .then(async () => server())
        .catch((error: string) => logger.error('TypeORM connection error:', { error }))