import { BaseContext } from "koa";

/**
 * restfull 统一格式
 * @param context 
 * @param statusCode 
 * @param body 
 */
export const response = (
    context: BaseContext,
    statusCode: number,
    body?: Record<string, any> | string | Array<Record<string, any>>,
): void => {
    context.status = statusCode
    context.body = body
}

/**
 * 成功返回格式
 * @param context 
 * @param data 
 * @param msg 
 */
 export const responseSuccess = (
    context: BaseContext,
    data?: any,
    msg = '成功',
): void => {
    response(context, 200, {
        code: 0,
        msg,
        data
    })
}

/**
 * 错误返回格式
 * @param context 
 * @param msg 
 */
 export const responseError = (
    context: BaseContext,
    msg = '失败',
    statusCode = 200,
): void => {
    response(context, statusCode, {
        code: -1,
        msg,
    })
}