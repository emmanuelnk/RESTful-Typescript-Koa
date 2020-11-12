import { SwaggerRouter } from 'koa-swagger-decorator'
import { auth, user } from '../controllers'

const unprotectedRouter = new SwaggerRouter()

// Auth
unprotectedRouter.post('/login', auth.loginUser)
unprotectedRouter.get('/refresh', auth.refreshToken)

// User
unprotectedRouter.post('/users', user.createUser)

export { unprotectedRouter }
