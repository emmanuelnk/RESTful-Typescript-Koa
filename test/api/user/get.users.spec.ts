import { expect, use } from 'chai'
import chaijsonSchema from 'chai-json-schema'
import request from 'supertest'
import { testServer } from '../../utils/connect'
import { requestValidationSchema } from '../../../src/entities/user.schema'
import { config } from '../../../src/config'
import jwt from 'jsonwebtoken'
import { generateUsers } from '../../utils/helpers'

use(chaijsonSchema)

const endpoint = { method: 'GET', route: '/users' }

describe(`${endpoint.method}: ${endpoint.route}`, () => {
    // GET /users
    it('should fail to get all users with wrong token', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // create an invalid access token
        const token = jwt.sign({}, 'aaaaaaaaa')
        
        // try to get all users
        const res = await request(testServer)
            .get(endpoint.route)
            .set('Authorization', 'bearer ' + token)

        expect(res.status).to.be.equal(401)
    })

    it('should get all users', async () => {
        const testUsers = generateUsers(5)

        // create these users in the db
        for(const testUser of testUsers)
            expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // create a valid token to access this endpoint 
        const token = jwt.sign({ email: testUsers[0].email }, config.jwt.accessTokenSecret, { expiresIn: config.jwt.accessTokenLife })

        // try to get all users
        const res = await request(testServer)
            .get(endpoint.route)
            .set('Authorization', 'bearer ' + token)

        expect(res.status).to.be.equal(200)
        expect(res.body.length).to.be.greaterThan(0)

        for (const item of res.body) {
            expect(item).to.be.jsonSchema(requestValidationSchema)
        }
    })
})