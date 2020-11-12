import { expect, use } from 'chai'
import chaijsonSchema from 'chai-json-schema'
import request from 'supertest'
import { testServer } from '../../utils/connect'
import { getUser, generateUsers } from '../../utils/helpers'
import { config } from '../../../src/config'

use(chaijsonSchema)

const endpoint = { method: 'GET', route: '/logout' }

describe(`${endpoint.method}: ${endpoint.route}`, () => {
    it('should successfully log out the user', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        // login this user and get token
        const loginRes = await request(testServer).post('/login').send({
            email: testUser.email,
            password: testUser.password,
        })

        // log out the user
        const res = await request(testServer)
            .get(endpoint.route)
            .set('Authorization', 'Bearer ' + loginRes.body.token)

        expect(res.status).to.be.equal(204)

        const loggedOutUser = await getUser(testUser.email) || {}

        expect(loggedOutUser.refreshToken).to.be.equal('removed')

        if(config.redis.blackListEnabled) {
            // try to access protected route with revoked token
            const res2 = await request(testServer)
                .get('/users')
                .set('Authorization', 'bearer ' + loginRes.body.token)
            
            expect(res2.status).to.be.equal(403)
            expect(res2.text).to.be.equal('Revoked Token')
        }

    })
})
