interface JwtSecrets {
    accessTokenSecret: string 
    accessTokenLife: string
    refreshTokenSecret: string
    refreshTokenLife: string
}

interface RedisConnDetails {
    port: number
    host: string
    password?: string
    blacklistKeyName?: string
    blackListEnabled?: string
}

export interface Config {
    nodeEnv: string
    port: number
    debugLogging: boolean
    dbsslconn: boolean
    jwt: JwtSecrets
    redis: RedisConnDetails
    databaseUrl: string
    dbEntitiesPath: string[]
}