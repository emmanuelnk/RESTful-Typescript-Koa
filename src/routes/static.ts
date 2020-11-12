import Router from '@koa/router'
import findRoot from 'find-root'
import send from 'koa-send'

const staticRouter = new Router()

// Static assets
const staticAge = {
    oneHourMs: 1000 * 60 * 60,
    oneDayMs: 1000 * 60 * 60 * 24,
    oneYearMs: 1000 * 60 * 60 * 24 * 365
}

const serveBase = process.env.NODE_ENV === 'production' ? '/dist/public/' : '/public/'

staticRouter.get('/', async context => send(context, context.path, { 
    root: `${findRoot(__dirname)}${serveBase}`, 
    index: 'index.html',
    immutable: true,
	maxAge: staticAge.oneYearMs,
}))

staticRouter.get('/readme.html', async context => send(context, context.path, { 
    root: `${findRoot(__dirname)}${serveBase}`, 
    immutable: true,
	maxAge: staticAge.oneDayMs,
}))

staticRouter.get('/favicon.ico', async context => send(context, context.path, { 
    root: `${findRoot(__dirname)}${serveBase}`, 
    immutable: true,
	maxAge: staticAge.oneDayMs,
}))

staticRouter.get('/assets/', async context => send(context, context.path, { 
    root: `${findRoot(__dirname)}${serveBase}`, 
    immutable: true,
	maxAge: staticAge.oneDayMs,
}))

export { staticRouter }