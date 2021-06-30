import http = require("http");
import Koa, { BaseContext, Context } from 'koa'
import { logger } from './utils/logger'
import { authSocketMiddleware } from './middlewares/auth_scoket_middleware'
import { RedisClient } from 'redis'
import { createAdapter } from 'socket.io-redis'
import { Server } from 'socket.io'
import SocketController from "./controllers/socket";
import { Cache } from "./utils/cache";

export const socketServer = async (server: http.Server, redis: RedisClient, app: Koa): Promise<Server> => {
    const io = new Server(server, {
        transports: ['websocket', 'polling'],
        serveClient: false,
        cors: {}
    })
    const pubClient = redis
    const subClient = redis.duplicate()
    io.adapter(createAdapter({pubClient, subClient}))

    io.use(authSocketMiddleware)
    
    io.on('connection', async (socket) => {
        // 获取链接参数
        const query = socket.handshake.query
        const roomName = 'room_' + query.room_id
        socket.data.user.room = roomName
        logger.info(`当前节点链接人数: ${socket.conn.server.clientsCount}`)
        logger.info(`系统链接人数：${await Cache.incrby('systemSocketCount', 1)}`)

        new SocketController(io, socket, roomName)
    })

    app.context.io = io
    return io
}
