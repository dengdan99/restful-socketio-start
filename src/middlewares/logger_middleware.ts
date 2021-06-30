import { Context } from 'koa'
import moment from 'moment'
import { logger } from '../utils/logger'

const loggerMiddleware = (winstonInstance: any) => {
    return async (ctx: Context, next: () => Promise<any>): Promise<void> => {
        
        const ip = ctx.request.get('X-Forwarded-For') || ctx.request.get('X-Real-IP')
        const bodyParams = ctx.body || ctx.request.body
        const logData = {
            'url': ctx.originalUrl,
            'request_method': ctx.request.method,
            'json_body': bodyParams ? JSON.stringify(bodyParams) : '',
            'ip': ip,
            'time': moment().format('YYYY-MM-DD HH:mm:ss'),
            'agent': ctx.request.header['user-agent']
            }
        const start = new Date().getTime()
        await next()
        const ms = new Date().getTime() - start

        let logLevel: string
        if (ctx.status >= 500) {
            logLevel = 'error'
        } else if (ctx.status >= 400) {
            logLevel = 'warn'
        } else {
            logLevel = 'info'
        }

        const msg = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`
        logger.info('access log -- ' + JSON.stringify(logData))
        winstonInstance.log(logLevel, msg)
    }
}

export { loggerMiddleware }
