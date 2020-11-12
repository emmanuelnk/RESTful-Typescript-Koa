import { expect, use } from 'chai'
import chaijsonSchema from 'chai-json-schema'
import request from 'supertest'
import { testServer } from '../../utils/connect'
import { requestValidationSchema } from '../../../src/entities/user.schema'
import { generateUsers } from '../../utils/helpers'

use(chaijsonSchema)

const endpoint = { method: 'POST', route: '/users' }

describe(`${endpoint.method}: ${endpoint.route}`, () => {
    it('should fail to create a new user with missing name', async () => {
        const res = await request(testServer).post(endpoint.route).send({
            email: 'emmanuel@test.com',
            dob: '1996-05-29',
            password: 'AAaa@@88$$99',
            address: '44-65 Laparella Cinco, Donella, Mexico City, Mexico',
            description: 'A versatile back-end node.js developer',
        })

        expect(res.status).to.be.equal(400)
    })

    it('should fail to create a new user with missing email', async () => {
        const res = await request(testServer).post(endpoint.route).send({
            name: 'Emmanuel',
            dob: '1996-05-29',
            password: 'AAaa@@88$$99',
            address: '44-65 Laparella Cinco, Donella, Mexico City, Mexico',
            description: 'A versatile back-end node.js developer',
        })

        expect(res.status).to.be.equal(400)
    })

    it('should fail to create a new user with missing dob', async () => {
        const res = await request(testServer).post(endpoint.route).send({
            name: 'Emmanuel',
            email: 'emmanuel@test.com',
            password: 'AAaa@@88$$99',
            address: '44-65 Laparella Cinco, Donella, Mexico City, Mexico',
            description: 'A versatile back-end node.js developer',
        })

        expect(res.status).to.be.equal(400)
    })

    it('should fail to create a new user with missing password', async () => {
        const res = await request(testServer).post(endpoint.route).send({
            name: 'Emmanuel',
            email: 'emmanuel@test.com',
            dob: '1996-05-29',
            address: '44-65 Laparella Cinco, Donella, Mexico City, Mexico',
            description: 'A versatile back-end node.js developer',
        })

        expect(res.status).to.be.equal(400)
    })

    it('should fail to create a new user with password that does not meet standards', async () => {
        const passwordErrors = {
            PasswordShorterThan6Characters: 'aaa',
            PasswordLongerThan50Characters: 'a'.repeat(55),
            MissingNumericCharacter: 'aaaaaaaaaaaaaaa',
            MissingUppercaseCharacter: 'aaaaaa9999',
            MissingLowercaseCharacter: 'AAAAA4444',
            MissingSpecialCharacter: 'aaaAAA999',
        }

        for(const [errorName, password] of Object.entries(passwordErrors)) {
            const res = await request(testServer).post(endpoint.route).send({
                name: 'Emmanuel',
                email: 'emmanuel@test.com',
                dob: '1996-05-29',
                password: password
            })
    
            expect(res.status).to.be.equal(400)

            expect(res.body).to.be.empty
            expect(res.text).to.be.a('string')
            expect(res.text).to.contain(errorName)
        }

    })

    it('should create a new user', async () => {
        const res = await request(testServer).post(endpoint.route).send({
            name: 'Emmanuel',
            email: 'emmanuel@test.com',
            dob: '1996-05-29',
            password: 'AAaa@@88$$99',
            address: '44-65 Laparella Cinco, Donella, Mexico City, Mexico',
            description: 'A versatile back-end node.js developer',
        })

        expect(res.status).to.be.equal(201)
        expect(res.body).to.be.jsonSchema(requestValidationSchema)
    })

    it('should fail to create a user who already exists', async () => {
        const testUser = generateUsers(1)[0]

        // create this user in the db
        expect((await request(testServer).post('/users').send(testUser)).status).to.be.equal(201)

        const res = await request(testServer).post(endpoint.route).send({
            name: testUser.name,
            email: testUser.email,
            dob: '1996-05-29',
            password: 'AAaa@@88$$99',
        })

        expect(res.status).to.be.equal(409)
    })

    it('should create a new user without address or description', async () => {
        const res = await request(testServer).post(endpoint.route).send({
            name: 'Mina',
            email: 'mina@test.com',
            dob: '1996-05-29',
            password: 'AAaa@@88$$99',
        })

        expect(res.status).to.be.equal(201)
        expect(res.body).to.be.jsonSchema(requestValidationSchema)
    })
})