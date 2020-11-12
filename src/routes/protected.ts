import { SwaggerRouter } from 'koa-swagger-decorator'
import { user, auth } from '../controllers'
import fs from 'fs'
import { minify } from 'html-minifier'

const description = fs.readFileSync(__dirname + '/swagger-description.html', 'utf8')

export const swaggerRouterOpts = {
    title: 'RESTful Typescript Koa',
    description: minify(description, { collapseWhitespace: true }),
    version: '1.0.0'
}

const protectedRouter = new SwaggerRouter()

// AUTH ROUTES
protectedRouter.get('/logout', auth.logoutUser)

// USER ROUTES
protectedRouter.get('/users', user.getUsers)
protectedRouter.get('/users/:id', user.getUser)
protectedRouter.put('/users/:id', user.updateUser)
protectedRouter.delete('/users/:id', user.deleteUser)

protectedRouter.swagger(swaggerRouterOpts)
protectedRouter.mapDir(__dirname + '/../')

export { protectedRouter }
