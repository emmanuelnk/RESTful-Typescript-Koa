import * as errors from '../../src/libraries/errors'
import { expect } from 'chai'

describe('Error Classes', () => {
    for (const errorConstructor of Object.values(errors)) {
        it(`${errorConstructor.name} instance should have name`, () => {
          const instance = new errorConstructor('')

          expect(instance.name).to.be.equal(errorConstructor.name)
        })
      }

})

