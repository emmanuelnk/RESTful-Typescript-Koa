import { Connection, createConnection } from 'typeorm'
import { config } from '../config'
import { createBlackList, BlackList, STORE_TYPE } from 'jwt-blacklist'

/**
 * Connects to a TypeORM connected database
 * 
 * @param  {string} url the database connection url
 * @param  {boolean} drop if true, drops the schema eachtime a connection to the db is made
 * @returns {Promise<Connection>} the database connection object
 */
export async function setupConnection(url: string, drop: boolean = false): Promise<Connection> {
    return createConnection({
        type: 'mongodb',
        url,    
        useNewUrlParser: true,      
        ssl: config.dbsslconn,
        authSource: 'admin',
        keepAlive: 600000,
        w: 'majority',
        entities: config.dbEntitiesPath,
        synchronize: true,
        useUnifiedTopology: true,
        dropSchema: drop,
        logging: false,
    })
}

/**
 * Connects to the redis based blacklist
 * 
 * @returns {Promise<BlackList>} Promise
 */
export async function blacklistConnection(): Promise<BlackList> {
    return createBlackList({
        daySize: 10000,
        errorRate: 0.001,
        storeType: STORE_TYPE.REDIS,
        redisOptions: {
            host: config.redis.host,
            port: config.redis.port,
            key: config.redis.blacklistKeyName,
        },
    })
}
