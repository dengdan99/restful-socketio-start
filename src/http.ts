import Koa from 'koa'
import jwt from 'koa-jwt'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import cors from '@koa/cors'
import config from 'config'

import { logger } from "./utils/logger";
import { unprotectedRouter } from './routes/unprotectedRoutes'
import { protectedRouter } from './routes/protectedRoutes'
import { catchError } from './middlewares/cactch_error'
import { loggerMiddleware } from './middlewares/logger_middleware'

export const httpServer = (): Koa => {
    const app = new Koa()

     // 加载helmet 安全配置
     app.use(helmet.contentSecurityPolicy({
        directives:{
            defaultSrc:["'self'"],
            scriptSrc:["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            styleSrc:["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
            fontSrc:["'self'","fonts.gstatic.com"],
            imgSrc:["'self'", "data:", "online.swagger.io", "validator.swagger.io"]
        }
    }))

    // 异常处理
    app.use(catchError)

    // 跨域配置
    app.use(cors())
    
    // 日志配置
    app.use(loggerMiddleware(logger))

    // 加载 bodyParser
    app.use(bodyParser())

    // 加载不用验证的路由
    app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods())

    // 加载 jwt
    app.use(
        jwt({
            secret: config.get('jwt.secret')
        }).unless({ path: [/^\/swagger-/,  /^\/general/, /^\/socket/] })
    )

    // 加载需要验证的路由
    app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods())

    // 定时任务启动
    // cron.start();

    return app
}