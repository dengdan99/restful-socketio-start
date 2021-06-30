import jwt from 'jsonwebtoken'
import { logger } from './logger'

export const decodeJwt = (token: string, secret: string): null | object | string => {
    let payload = null
    if (token.indexOf('Bearer') >= 0) {
        token = token.slice(7)
    }
    try {
        payload = jwt.verify(token, secret)
    } catch (err) {
        logger.warn('jwt 解码失败')
        return null
    }
    return payload
}