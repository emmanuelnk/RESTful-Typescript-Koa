import { expect, use } from 'chai'
import chaijsonSchema from 'chai-json-schema'
import request from 'supertest'
import { testServer } from '../../utils/connect'
import { config } from '../../../src/config'
import jwt from 'jsonwebtoken'
import { generateUsers } from '../../utils/helpers'
import { decodedJWTSchema } from '../../utils/schemas'

use(chaijsonSchema)

const endpoint = { method: 'GET', route: '/refresh' }

describe(`${endpoint.method}: ${endpoint.route}`, () => {
    it('should fail to get a new token with invalid access token', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // create invalid token
        const token = jwt.sign({}, config.jwt.accessTokenSecret, { expiresIn: config.jwt.accessTokenLife })

        // try to get a new access token
        const res = await request(testServer)
            .get(endpoint.route)
            .set('Authorization', 'bearer ' + token)

        expect(res.status).to.be.equal(403)
    })

    it('should get back same token with a valid access token', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // login this user and get token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        // try to get back the same access token
        const res = await request(testServer)
            .get(endpoint.route)
            .set('Authorization', 'bearer ' + loginRes.body.token)

        expect(res.status).to.be.equal(200)
        expect(res.body.token).to.be.equal(loginRes.body.token)

        // regex for jwt token
        expect(res.body.token).to.match(/^[\w=-]+\.[\w=-]+\.?[\w+./=-]*$/)

        // verify the token
        expect(jwt.verify(res.body.token, config.jwt.accessTokenSecret)).to.be.jsonSchema(decodedJWTSchema)
    })

    it('should get back new token with a valid access token', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // login this user and to  generate their refreshToken
        await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })
            
        // create an expired token for this user
        const now = Math.floor(Date.now() / 1000)
        const token = jwt.sign(
            { id: testUser.id, email: testUser.email, iat: now - 3600, exp: now - 1800 },
            config.jwt.accessTokenSecret,
        )

        // try to get a new access token
        const res = await request(testServer)
            .get(endpoint.route)
            .set('Authorization', 'bearer ' + token)

        expect(res.status).to.be.equal(200)
        expect(res.body.token).to.not.be.equal(token)

        // regex for jwt token
        expect(res.body.token).to.match(/^[\w=-]+\.[\w=-]+\.?[\w+./=-]*$/)

        // verify the token
        expect(jwt.verify(res.body.token, config.jwt.accessTokenSecret)).to.be.jsonSchema(decodedJWTSchema)
    })
})
