import dotenv from 'dotenv'
import { Config } from './interfaces/config.interfaces'

dotenv.config({ path: '.env' })

// mongo
const isTestMode = process.env.NODE_ENV === 'test'
const isDevelopmentMode = process.env.NODE_ENV === 'development'
const databaseUrl = process.env.DATABASE_URL || 'mongodb://user:pass@localhost:27017/apidb'

// redis defaults
const redis = {
    host: '127.0.0.1',
    port: 6379,
    blacklistEnabled: process.env.REDIS_BLACKLIST_ENABLED || isTestMode || '',
    blacklistKeyName: process.env.REDIS_BLACKLIST_KEYNAME || 'jwt-blacklist',
}

if(process.env.REDIS_URL) {
    const redisUrl = process.env.REDIS_URL

    redis.port = Number.parseInt(redisUrl.split(':').slice(3).join(''))
    redis.host = redisUrl.split(':').slice(2,3).join('')
}

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
    redis,
    databaseUrl,
    dbEntitiesPath: [...(isDevelopmentMode || isTestMode ? ['src/entities/**/*.ts'] : ['dist/entities/**/*.js'])],
}

export { config }
