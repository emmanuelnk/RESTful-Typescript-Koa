import chai from 'chai'
import { bcryptCompareAsync, bcryptHashAsync } from '../../src/libraries/crypto'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

const expect = chai.expect

describe('fn: bcryptCompareAsync', () => {
    it('should return false when comparing a wrong unencrypted string to a correct hash', async () => {
        expect(bcryptCompareAsync('a_wrong_thing', '$2y$12$BHQAJ1FvhPy0vkC0QxxG4OsF22hxEQ3EgClw4vHR9yU7rVZ5wIkaO')).to.eventually.equal(false)
    })

    it('should return true when comparing a wrong unencrypted string to a correct hash', async () => {
        expect(bcryptCompareAsync('something_to_encrypt', '$2y$12$BHQAJ1FvhPy0vkC0QxxG4OsF22hxEQ3EgClw4vHR9yU7rVZ5wIkaO')).to.eventually.equal(true)
    })
})

describe('fn: bcryptHashAsync', () => {
    it('should successfully return a hashed string', async () => {
        const testString = 'something_to_encrypt'
        const hashedString = await bcryptHashAsync(testString, 8)

        expect(hashedString).to.not.equal(testString)
        expect(bcryptCompareAsync(testString, hashedString)).to.eventually.equal(true)
    })
})