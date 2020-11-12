import * as bcrypt from 'bcryptjs'

/**
 * Compares hashed string with unencrypted string
 * 
 * @param  {string} unencryptedString the unencrypted string to compare
 * @param  {string} hashedString the hashed string to compare the unencrypted string to
 * @returns {Promise<boolean>} a promise of the compare result
 */
export const bcryptCompareAsync = (unencryptedString: string, hashedString: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(unencryptedString, hashedString, (error, res) => {
            if (error) reject(error)
           
            resolve(res)    
        })
    });
}

/**
 * Asynchronously hashes a string with set level of salt
 * 
 * @param  {string} string the unencrypted string
 * @param  {number|string} salt the salt level for the hashing algorithm
 * @returns {Promise<string>} the hashed string
 */
export const bcryptHashAsync = (string: string, salt: number | string): Promise<string> => bcrypt.hash(string, salt)