import { expect, use } from 'chai'
import chaijsonSchema from 'chai-json-schema'
import request from 'supertest'
import { testServer } from '../../utils/connect'
import { requestValidationSchema } from '../../../src/entities/user.schema'
import { getUser, generateUsers } from '../../utils/helpers'

use(chaijsonSchema)

const endpoint = { method: 'PUT', route: '/users/:id' }

describe(`${endpoint.method}: ${endpoint.route}`, () => {
    it('should update the name of a user if request token is user themselves', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // get this users id from db
        const createUpdateUserModel = await getUser(testUser.email) || {}

        // login this user and get token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        const res = await request(testServer)
            .put(endpoint.route.replace(':id', createUpdateUserModel.id))
            .set('Authorization', 'bearer ' + loginRes.body.token)
            .send({
                name: 'Emmanuel NewName',
                email: testUser.email,
            })

        expect(res.status).to.be.equal(200)
        expect(res.body).to.be.jsonSchema(requestValidationSchema)
        expect(res.body.name).to.be.equal('Emmanuel NewName')
    })

    it('should NOT update the name of a user if request token is not the user themself(403 Forbidden)', async () => {
        const testUsers = generateUsers(2)

        // create these users in the db
        for (const testUser of testUsers)
            expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // get this users id from db
        const createUpdateUserModel = await getUser(testUsers[1].email) || {}

        // login this user and get token
        const loginRes = await request(testServer).post('/login').send({
            email: testUsers[0].email,
            password: testUsers[0].password,
        })

        const res = await request(testServer)
            .put(endpoint.route.replace(':id', createUpdateUserModel.id))
            .set('Authorization', 'bearer ' + loginRes.body.token)
            .send({
                name: 'Emmanuel NewName',
                email: 'emmanuel@test.com',
            })

        expect(res.status).to.be.equal(403)
    })

    it('should NOT update the name of a user if user id is wrong', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // login this user and get token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        const res = await request(testServer)
            .put(endpoint.route.replace(':id', '@<bad$_id>@'))
            .set('Authorization', 'bearer ' + loginRes.body.token)
            .send({
                name: 'Emmanuel NewName',
                email: testUser.email,
            })

        expect(res.status).to.be.equal(400)
    })

    it('should NOT update the name of a user if user id is misiing (405 Method Not Allowed)', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // login this user and get token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        const res = await request(testServer)
            .put(endpoint.route.replace(':id', ''))
            .set('Authorization', 'bearer ' + loginRes.body.token)
            .send({
                name: 'Emmanuel NewName',
                email: testUser.email,
            })

        expect(res.status).to.be.equal(405)
    })

})