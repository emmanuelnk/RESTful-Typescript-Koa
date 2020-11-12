import shortid from 'shortid'
import { BaseContext } from 'koa'
import { getManager, Repository } from 'typeorm'
import { User } from '../entities/user'
import { UserPublic } from '../interfaces/user.interfaces'
import * as errors from '../libraries/errors'
import { logger } from '../libraries/logger'

/**
 * Fetches all users in the user collection
 * 
 * @param  {BaseContext} context Koa context object
 * @param  {Record<string, any>} qryObj a database query object
 * @returns {Promise<Array<UserPublic>>} a promise with array of fetched users
 */
export const findAllUsers = async function (context: BaseContext, qryObj: Record<string, any>): Promise<Array<UserPublic>> {
    const userRepository: Repository<User> = getManager().getRepository(User)
    let users = []

    try {
        users = await userRepository.find(qryObj)
    } catch (error) {
        logger.error('findAllUsers', { error })
        context.throw(new errors.InternalServerError())
    }

    return users.map((user: User): UserPublic => user.public())
}

/**
 * Fetches a single user from the user collection
 * 
 * @param  {BaseContext} context Koa context object
 * @param  {Record<string, any>} qryObj a database query object
 * @param  {boolean} isPublic whether the returned user object should hide sensitive fields. true by default
 * @returns {Promise<User|UserPublic>} a promise with the fetched user
 */
export const findUser = async function (context: BaseContext, qryObj: Record<string, any>, isPublic:boolean = true): Promise<User|UserPublic> {
    const userRepository: Repository<User> = getManager().getRepository(User)
    let user

    try {
        user = await userRepository.findOne(qryObj)
    } catch (error) {
        logger.error('findUser', { error })
        context.throw(new errors.InternalServerError())
    }

    if (!user) context.throw(new errors.UserNotFound())

    return isPublic ? user.public() : user
}

/**
 * Checks if the user already exists in the collection
 * 
 * @param  {BaseContext} context Koa context object
 * @param  {Record<string, any>} qryObj a database query object
 * @returns {Promise<void>} a void promise if user doesn't exists. throws error if user already exists 
 */
export const checkIfUserAlreadyExists = async function (context: BaseContext, qryObj: Record<string, any>): Promise<void> {
    const userRepository: Repository<User> = getManager().getRepository(User)

    try {
        if(!await userRepository.findOne(qryObj)) return
    } catch (error) {
        logger.error('checkIfUserAlreadyExists', { error })
        context.throw(new errors.InternalServerError())
    }   

    context.throw(new errors.UserAlreadyExists())
}
/**
 * Checks if the users password matches the saved hash
 * 
 * @param  {BaseContext} context Koa context object
 * @param  {User} user the user whose password is to be checked
 * @returns {Promise<void>} a void promise if correct. throws otherwise
 */
export const checkIfUserPasswordCorrect = async function(context: BaseContext, user: User): Promise<void> {
    if (!(await user.checkIfUnencryptedPasswordIsValid(context.request.body.password)))
        context.throw(new errors.InvalidUserPassword('WrongPassword'))
    
    return
}

/**
 * Returns a new User model for saving a new user
 * 
 * @param  {BaseContext} context Koa context object
 * @returns {User} the created user model
 */
export const createNewUserModel = function (context: BaseContext): User {
    const user: User = new User()

    user._id = shortid.generate()
    user.name = context.request.body.name
    user.email = context.request.body.email
    user.password = context.request.body.password
    user.dob = context.request.body.dob
    user.address = context.request.body.address || ''
    user.description = context.request.body.description || ''

    return user
}

/**
 * Returns a new User model for saving an updated user
 * 
 * @param  {BaseContext} context Koa context object
 * @returns {User} the created user model
 */
export const createUpdateUserModel = function (context: BaseContext): User {
    const user: User = new User()

    user._id = context.params.id
    user.name = context.request.body.name
    user.email = context.request.body.email
    user.password = context.request.body.password
    user.dob = context.request.body.dob
    user.address = context.request.body.address
    user.description = context.request.body.description

    // remove fields that should not be updated
    delete user.createdAt

    return user
}

/**
 * Saves a new user in the User collection
 * 
 * @param  {BaseContext} context Koa context object
 * @param  {User} user the user to be saved 
 * @returns {Promise<User>} a promise with the saved user
 */
export const saveNewUser = async function (context: BaseContext, user: User): Promise<User> {
    const userRepository: Repository<User> = getManager().getRepository(User)

    if (typeof user.dob === 'string') user.dob = new Date(user.dob)

    try {
        await user.hashPassword()
   
        return userRepository.save(user)
    } catch (error) {
        logger.error('saveNewUser', { error })
        context.throw(new errors.InternalServerError())
    }
}

/**
 * Saves an updated user in the User collection
 * 
 * @param  {BaseContext} context Koa context object
 * @param  {User} user the user to be saved
 * @returns {Promise<User>}  a promise with the saved updated user
 */
export const updateUser = async function (context: BaseContext, user: User): Promise<User> {
    const userRepository: Repository<User> = getManager().getRepository(User)

    if (typeof user.dob === 'string') user.dob = new Date(user.dob)

    try {
        delete user.password
        delete user.createdAt
  
        return userRepository.save(user)
    } catch (error) {
        logger.error('updateUser', { error })
        context.throw(new errors.InternalServerError())
    }
}

/**
 * @param  {BaseContext} context Koa context object
 * @param  {User} user the user to be removed
 * @returns {Promise<User>} a promise with the removed user
 */
export const removeUser = async function (context: BaseContext, user: User): Promise<User> {
    const userRepository: Repository<User> = getManager().getRepository(User)

    try {
        return userRepository.remove(user)
    } catch (error) {
        logger.error('removeUser', { error })
        context.throw(new errors.InternalServerError())
    }
}