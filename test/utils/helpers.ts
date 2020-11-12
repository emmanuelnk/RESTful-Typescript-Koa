// eslint-disable-next-line @typescript-eslint/no-var-requires
const phonetic = require('phonetic')

import { Db } from 'mongodb'
import { mongo } from './connect'

// global db connection
let database: Db | undefined

;(async () => {
    if (!mongo.db) database = await mongo.connect()
})()

/**
 * Gets a test user from the database
 * 
 * @param  {string} email the email of the user to fetch from the db
 * @returns {Promise<Record<string, any> | undefined>} Promise returns the found user document else null if not found
 */
export async function getUser(email: string): Promise<Record<string, any> | undefined> {
    if (!database) throw new Error('getTestDbUser: no_test_db_conn')

    const user = await database.collection('user').findOne({ email })

    if(!user) return

    return { id: user._id, ...user }
}

/**
 *  Generates test users for the tests
 * 
 * @param  {number} number the number of users to generate
 * @returns {Array<any>} Promise with array containing the users who were generated
 */
export function generateUsers(number: number): Array<any> {
    const newUsers = new Array(number).fill({}).map(() => {
        const name = phonetic.generate({ syllables: 2 }).toLowerCase()

        return {
            name: `${name}`,
            email: `${name}@test.com`,
            password: 'AAaa@@88$$99',
            dob: '1996-05-29',
            address: 'some random address',
            description: 'some random description',
        }
    })

    return newUsers
}
