import { expect, use } from 'chai'
import chaijsonSchema from 'chai-json-schema'
import request from 'supertest'
import { testServer } from '../../utils/connect'
import { requestValidationSchema } from '../../../src/entities/user.schema'
import jwt from 'jsonwebtoken'
import { getUser, generateUsers } from '../../utils/helpers'

use(chaijsonSchema)

const endpoint = { method: 'GET', route: '/users/:id' }

describe(`${endpoint.method}: ${endpoint.route}`, () => {
    it('should fail to get a user with wrong token', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // get this users id from db
        const userToFetch = await getUser(testUser.email) || {}

        // create an invalid access token
        const token = jwt.sign({}, 'aaaaaaaaa')


        const res = await request(testServer)
            .get(endpoint.route.replace(':id', userToFetch.id))
            .set('Authorization', 'bearer ' + token)

        expect(res.status).to.be.equal(401)
    })

    it('should fail to get a user with wrong id', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // login this user and get token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        const res = await request(testServer)
            .get(endpoint.route.replace(':id', '@<bad$_id>@'))
            .set('Authorization', 'bearer ' + loginRes.body.token)

        expect(res.status).to.be.equal(400)
    })

    it('should get a user by id', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // get this users id from db
        const userToFetch = await getUser(testUser.email) || {}

        // login this user and get token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        const res = await request(testServer)
            .get(endpoint.route.replace(':id', userToFetch.id))
            .set('Authorization', 'bearer ' + loginRes.body.token)

        expect(res.status).to.be.equal(200)
        expect(res.body).to.be.jsonSchema(requestValidationSchema)
    })
})