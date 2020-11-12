import { Context } from 'koa'
import { config } from '../config'
import { transports, format } from 'winston'
import path from 'path'

const loggerMiddleware = (winstonInstance: any): any => {
    winstonInstance.configure({
        level: config.debugLogging ? 'debug' : 'info',
        transports: [
            // write logs to file
            new transports.File({ filename: path.resolve(__dirname, '../../error.log'), level: 'error' }),
            // write logs to console
            new transports.Console({
                format: format.combine(format.colorize(), format.simple()),
            }),
        ],
    })

    return async (context: Context, next: () => Promise<any>): Promise<void> => {
        const start = new Date().getTime()

        try {
            await next()
        } catch (error) {
            context.status = error.status || 500
            context.body = error.message
        }

        const ms = new Date().getTime() - start

        let logLevel: string

        if (context.status >= 500) {
            logLevel = 'error'
        } else if (context.status >= 400) {
            logLevel = 'warn'
        } else {
            logLevel = 'info'
        }

        const message = `${context.method} ${context.originalUrl} ${context.status} ${ms}ms`

        winstonInstance.log(logLevel, message)
    }
}

export { loggerMiddleware }
