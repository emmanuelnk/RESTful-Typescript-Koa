import ratelimit from 'koa-ratelimit'

// in memory db
const database = new Map()

export const rateLimiter = ratelimit({
    driver: 'memory',
    db: database,
    duration: 60000,
    errorMessage: 'Sometimes You Just Have to Slow Down.',
    id: (context) => context.ip,
    headers: {
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total',
    },
    max: 100,
    disableHeader: false
})
