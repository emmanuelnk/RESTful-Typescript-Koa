import dotenv from 'dotenv'
import { Config } from './interfaces/config.interfaces'

dotenv.config({ path: '.env' })

const isTestMode = process.env.NODE_ENV === 'test'
const isDevelopmentMode = process.env.NODE_ENV === 'development'
const databaseUrl = process.env.DATABASE_URL || 'mongodb://user:pass@localhost:27017/apidb'

const config: Config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: +(process.env.PORT || 3000),
    debugLogging: isDevelopmentMode,
    dbsslconn: databaseUrl.includes('+srv'), // check if server url (+srv) or localhost url
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'your-secret-whatever',
        accessTokenLife: process.env.JWT_ACCESS_TOKEN_LIFE || '15m',
        refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'your-refresh-whatever',
        refreshTokenLife: process.env.JWT_REFRESH_TOKEN_LIFE || '24h'
    }, 
    redis: {
        port: Number.parseInt(process.env.REDIS_PORT || '6379'),
        host: process.env.REDIS_HOST || '127.0.0.1',
        blacklistKeyName: process.env.REDIS_BLACKLIST_KEYNAME || 'jwt-blacklist',
        blackListEnabled: process.env.REDIS_BLACKLIST_ENABLED || undefined
    },
    databaseUrl,
    dbEntitiesPath: [...(isDevelopmentMode || isTestMode ? ['src/entities/**/*.ts'] : ['dist/entities/**/*.js'])],
}

export { config }
