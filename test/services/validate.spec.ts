import chai from 'chai'
import { validateRequest, validateRequiredProperties, isExpired, validateShortID } from '../../src/services/validate'
import { requestValidationSchema } from '../../src/entities/user.schema'
import { context } from '../utils/koa-context'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

const expect = chai.expect

describe('ValidateService.validateRequest', () => {
    it('should validate an object based on a schema', async () => {
        const reqObjectToValidate = {
            name: 'Emmanuel',
            email: 'emmanuel@test.com',
            dob: '1996-05-30',
            password: 'AAaa@@88$$99',
            address: '44-65 Laparella Cinco, Donella, Mexico City, Mexico',
            description: 'A versatile back-end node.js developer',
        }

        expect(validateRequest(context(), reqObjectToValidate, requestValidationSchema, [])).to.eventually.equal(undefined)
    })

    it('should fail to validate an object when a required prop is missing', async () => {
        const reqObjectToValidate = {
            name: 'Emmanuel',
            email: 'emmanuel@test.com',
            dob: '1996-05-30',
            address: '44-65 Laparella Cinco, Donella, Mexico City, Mexico',
            description: 'A versatile back-end node.js developer',
        }

        expect(validateRequest(context(), reqObjectToValidate, requestValidationSchema, ['password'])).to.rejectedWith('Missing Request Parameters: password')
    })
})

describe('ValidateService.validateRequiredProperties', () => {
    it('should return missing props on an object', () => {
        const object = {
            name: 'James',
            age: 26,
            eye: 'blue'
        }

        expect(() => validateRequiredProperties(context(), object, ['address'])).to.throw('Missing Request Parameters: address')

        const missingProperties = validateRequiredProperties(context(), object, ['name', 'age', 'eye'])

        expect(missingProperties.length).to.be.equal(0)
    })
})

describe('ValidateService.isExpired', () => {
    it('should return a boolean if a given unix timestamp is before or after current time', async () => {
        let isExpiredTime = isExpired(5000)

        expect(isExpiredTime).to.be.true

        isExpiredTime = isExpired(Math.floor(Date.now() /1000) + 5000)

        expect(isExpiredTime).to.be.false

    })
})

describe('ValidateService.validateShortID', () => {
    it('should return undefined if id is valid shortid', async () => {
        expect(validateShortID(context(), 'hmsd63a')).to.be.undefined
    })

    it('should throw an error if id is invalid shortid', async () => {
        expect(() => validateShortID(context(), '@$@#aasd')).to.throw('Invalid User ID')
    })
})