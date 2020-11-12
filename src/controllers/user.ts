import { BaseContext } from 'koa'
import { request, summary, path, body, responses, tagsAll } from 'koa-swagger-decorator'
import { User } from '../entities/user'
import { createUserSchema, updateUserSchema, requestValidationSchema } from '../entities/user.schema'
import * as UserService from '../services/user'
import * as AuthService from '../services/auth'
import * as ValidationService from '../services/validate'
import { response } from '../libraries/helpers'

@tagsAll(['User'])
export default class UserController {
    @request('get', '/users')
    @summary('Find all users')
    @responses({
        200: { description: 'Success' },
        400: { description: 'Error' },
        401: { description: 'Token authorization error' },
        404: { description: 'Users not found' },
    })
    public static async getUsers(context: BaseContext): Promise<void> {
        response(context, 200, await UserService.findAllUsers(context, {}))
    }

    @request('get', '/users/{id}')
    @summary('Find user by id')
    @path({ id: { type: 'string', required: true, description: 'id of user to fetch' } })
    @responses({
        200: { description: 'success' },
        400: { description: 'validation error, user not found' },
        401: { description: 'token authorization error' },
    })
    public static async getUser(context: BaseContext): Promise<void> {
        await ValidationService.validateRequest(context, { _id: context.params.id }, requestValidationSchema, [
            '_id',
        ])

        response(context, 200, await UserService.findUser(context, { _id: context.params.id }))
    }

    @request('post', '/users')
    @summary('Create a user')
    @body(createUserSchema)
    @responses({
        201: { description: 'user created successfully' },
        400: { description: 'missing parameters, invalid password, validation errors' },
        409: { description: 'user already exists' },
    })
    public static async createUser(context: BaseContext): Promise<void> {
        const userToBeCreated = UserService.createNewUserModel(context)

        await ValidationService.validateRequest(context, userToBeCreated, requestValidationSchema, [
            'name',
            'email',
            'dob',
            'password',
        ])
        await UserService.checkIfUserAlreadyExists(context, { email: userToBeCreated.email })
        await UserService.saveNewUser(context, userToBeCreated)

        response(context, 201, 'UserCreated')
    }

    @request('put', '/users/{id}')
    @summary('Update a user')
    @path({ id: { type: 'string', required: true, description: 'id of user to update' } })
    @body(updateUserSchema)
    @responses({
        200: { description: 'user updated successfully' },
        400: { description: 'user not found, user already exists, validation errors, user already exists' },
        401: { description: 'token authorization error' },
        403: { description: 'not authorized to perform this action' },
    })
    public static async updateUser(context: BaseContext): Promise<void> {
        const userToBeUpdated = UserService.createUpdateUserModel(context)

        await ValidationService.validateRequest(context, userToBeUpdated, requestValidationSchema, ['_id'])
        await AuthService.verifyTokenEmail(context, userToBeUpdated)
        await UserService.findUser(context, { _id: context.params.id })

        response(context, 200, (await UserService.updateUser(context, userToBeUpdated)).public())
    }

    @request('delete', '/users/{id}')
    @summary('Delete user by id')
    @path({ id: { type: 'string', required: true, description: 'id of user' } })
    @responses({
        204: { description: 'user deleted successfully' },
        400: { description: 'user not found, validation errors' },
        401: { description: 'token authorization error' },
        403: { description: 'not authorized to perform this action' },
    })
    public static async deleteUser(context: BaseContext): Promise<void> {
        await ValidationService.validateRequest(context, { _id: context.params.id }, requestValidationSchema, [
            '_id',
        ])

        const userToRemove = await UserService.findUser(context, { _id: context.params.id }, false)

        await AuthService.verifyTokenEmail(context, <User>userToRemove)
        await UserService.removeUser(context, <User>userToRemove)

        response(context, 204)
    }
}
