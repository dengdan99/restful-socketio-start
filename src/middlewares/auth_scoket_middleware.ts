// import { Socket } from 'socket.io'

import { } from "koa-jwt"
import config from "config"
import { decodeJwt } from "../utils/auth"
import { Socket } from "socket.io"
import { logger } from "../utils/logger"

export const authSocketMiddleware = async (socket: Socket, next) => {
    try {
        let user = null
        const query = socket.handshake.query
        if (query.token && typeof query.token === 'string') {
            user = decodeJwt(query.token, config.get('jwt.secret'))
        } else if (socket.handshake.auth && socket.handshake.auth.token)  {
            user = decodeJwt(socket.handshake.auth.token, config.get('jwt.secret'))
        } else {
            let headers = socket.client.request.headers
            if(!headers.authorization) throw new Error('not found jwt token')
            user = decodeJwt(headers.authorization, config.get('jwt.secret'))
        }
        if (user) {
            // 挂载在user上
            socket.data.user = user
        } else {
            throw new Error('jwt token decode fail')
        }
        next()
    } catch(err) {
        if (err instanceof Error) {
            logger.warn(err.message)
        }
        socket.disconnect()
        logger.warn(`非法链接，已经断开, 来自 ${socket.handshake.address}`)
        next(err)
    }
}