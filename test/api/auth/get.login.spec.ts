import { expect, use } from 'chai'
import chaijsonSchema from 'chai-json-schema'
import request from 'supertest'
import { testServer } from '../../utils/connect'
import { generateUsers } from '../../utils/helpers'

use(chaijsonSchema)

const endpoint = { method: 'GET', route: '/login' }

describe(`${endpoint.method}: ${endpoint.route}`, () => {
    it('should fail to login user with missing email', async () => {
        const testUser = generateUsers(1)[0]
 
        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // try to log the user in
        const res = await request(testServer).post(endpoint.route).send({
            password: testUser.password,
        })

        expect(res.status).to.be.equal(400)
    })

    it('should fail to login user with missing password', async () => {
        const testUser = generateUsers(1)[0]
 
        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // try to log the user in
        const res = await request(testServer).post(endpoint.route).send({
            email: testUser.email,
        })

        expect(res.status).to.be.equal(400)
    })

    it('should fail to login user with wrong password', async () => {
        const testUser = generateUsers(1)[0]
 
        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // try to log the user in
        const res = await request(testServer).post(endpoint.route).send({
            email: testUser.email,
            password: 'BBbb33%%99$$rr'
        })

        expect(res.status).to.be.equal(400)
        expect(res.text).to.be.equal('Invalid User Password: WrongPassword')
    })

    it('should login user successfully', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // try to log the user in
        const res = await request(testServer).post(endpoint.route).send({
            email: testUser.email,
            password: testUser.password,
        })

        expect(res.status).to.be.equal(200)
        expect(res.body.token).to.match(/^[\w=-]+\.[\w=-]+\.?[\w+./=-]*$/)
    })
})
