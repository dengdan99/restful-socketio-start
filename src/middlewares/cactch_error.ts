import { Context, Next } from "koa";
import { logger } from "../utils/logger";


/**
 * 错误处理中间件
 * @param ctx 
 * @param next 
 * @returns 
 */
export const catchError = async (ctx: Context, next: Next) => {
    try {
        await next()
    } catch (err) {
        let code = 500
        let msg = '服务器异常'
        if (err.status && err.status === 401) {
            logger.error('无效权限')
            logger.error(err.toString())
            ctx.status = 401
            code = 401
            msg = err.originalError ? err.originalError.message : err.message
        } else {
            // 生产环境下只显示权限错误
            if (process.env.NODE_ENV == "production") {
                ctx.body = {
                    code,
                    msg
                }
                return
            }
            logger.error('服务异常')
            logger.error(err.toString())
            if (err.code) {
                ctx.status = 520
                code = err.code
                msg = err.msg
            } else if (err instanceof Error) {
                ctx.status = 510
                code = 510
                msg = err.message
            } else {
                throw err
            }
        }
        
        ctx.body = {
          code,
          msg
        }
    }
    // return next().catch((err) => {
    //     logger.error('异常处理')
    //     logger.error(err.toString())
    //     let code = 500
    //     let msg = 'unknown error'
    //     if (err.status && err.status === 401) {
    //         ctx.status = 401
    //         code = 401
    //         msg = err.originalError ? err.originalError.message : err.message
    //     } else if (err.code) {
    //         ctx.status = 520
    //         code = err.code
    //         msg = err.msg
    //     } else if (err instanceof Error) {
    //         ctx.status = 510
    //         code = 510
    //         msg = err.message
    //     } else {
    //         throw err
    //     }
    //     ctx.body = {
    //       code,
    //       msg
    //     }
    // })
}