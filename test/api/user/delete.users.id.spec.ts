import { expect, use } from 'chai'
import chaijsonSchema from 'chai-json-schema'
import request from 'supertest'
import { testServer } from '../../utils/connect'
import { getUser, generateUsers } from '../../utils/helpers'

use(chaijsonSchema)

const endpoint = { method: 'DELETE', route: '/users/:id' }

describe(`${endpoint.method}: ${endpoint.route}`, () => {
    it('should NOT delete the user if request token is not the user themself(403 Forbidden)', async () => {
        const testUsers = generateUsers(2)

        // create these users in the db
        for(const testUser of testUsers)
            expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // get user 2 id from sb
        const userToDelete = await getUser(testUsers[1].email) || {}

        // login user 1 and get their token
        const loginRes = await request(testServer).post('/login').send({
            email: testUsers[0].email,
            password: testUsers[0].password,
        })

        // try to delete user 2
        const res = await request(testServer)
            .delete(endpoint.route.replace(':id', userToDelete.id))
            .set('Authorization', 'bearer ' + loginRes.body.token)

        expect(res.status).to.be.equal(403)
    })

    it('should NOT delete the user if user id is wrong', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // login user and get their token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        // user tries to delete themselves
        const res = await request(testServer)
            .delete(endpoint.route.replace(':id', '@<bad$_id>@'))
            .set('Authorization', 'bearer ' + loginRes.body.token)

        expect(res.status).to.be.equal(400)
    })

    it('should NOT delete the user if user id is misiing (405 Method Not Allowed)', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // login user and get their token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        // user tries to delete themselves
        const res = await request(testServer)
            .delete(endpoint.route.replace(':id', ''))
            .set('Authorization', 'bearer ' + loginRes.body.token)

        expect(res.status).to.be.equal(405)
    })

    it('should delete the user if request token is user themselves', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // get this users id from db
        const userToDelete = await getUser(testUser.email) || {}

        // login user and get their token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        // user tries to delete themselves
        const res = await request(testServer)
            .delete(endpoint.route.replace(':id', userToDelete.id))
            .set('Authorization', 'bearer ' + loginRes.body.token)

        expect(res.status).to.be.equal(204)

        expect(await getUser(testUser.id)).to.be.undefined
    })
})