import { chunk, throttle } from "lodash";
import { ParsedUrlQuery } from "querystring";
import { Server, Socket } from "socket.io";
import { Cache } from "../utils/cache";
import { logger } from "../utils/logger";

export default class SocketController {
    public cacheZListKey = 'asd'

    public cachePrefixScoketIdKey = 'socket_id:'
    public cachePrefixUserIdKey = 'user_id:'

    private socket: Socket
    private io: Server
    private timer: NodeJS.Timeout

    public query: ParsedUrlQuery
    public roomId: string
    public userInfo

    constructor(io: Server, socket: Socket, roomId: string) {
        this.io = io
        this.socket = socket
        this.query = socket.handshake.query
        this.roomId = socket.data.user.room
        this.userInfo = socket.data.user
        this.joinRoom(this.roomId)
        this.initListening()
    }

    public initListening () {
        this.socket.on('message', this.handlerMessage.bind(this))
        // 如果是高频事件， 这里使用 throttle 截流, 保证整体的可用性
        this.socket.on('concurrent', throttle(this.handlerConcurrent.bind(this), 100))
        this.socket.on('start/stop', this.showRank.bind(this))
        this.socket.on('clear', this.clearRank.bind(this))
        this.socket.on('disconnect', this.disconnect.bind(this))

        this.socket.on('error', (error) => {
            logger.warn('链接错误: user' + this.socket.data.user.toString())
            logger.warn(error.message.toString())
        })
    }

    public async disconnect(reason) {
        // logger.info(`当前节点链接人数: ${socket.conn.server.clientsCount}`)
        await Cache.del(this.cachePrefixScoketIdKey + this.socket.id)
        await Cache.del(this.cachePrefixUserIdKey + this.userInfo.id)
        logger.info(`系统链接人数：${await Cache.decrby('systemSocketCount', 1)}`)
        logger.info('a client disconnect:' + this.socket.id)
    }

    public async joinRoom(roomId) {
        try {
            await this.socket.join(roomId)
            await Cache.set(this.cachePrefixScoketIdKey + this.socket.id, this.userInfo.id)
            await Cache.hset(this.cachePrefixUserIdKey + this.userInfo.id, {
                socket_id: this.socket.id,
                name: this.userInfo.name,
                mobile: this.userInfo.mobile
            })
            // logger.info(`当前服务器房间 ${this.roomId} 人数: ${this.io.sockets.adapter.rooms.get(this.roomId).size}`)
            // 向房间所有人发送消息（不包括自己）
            // volatile 使用后客户端不一定能收到消息，但效率较高
            this.socket.volatile.broadcast.to(this.roomId).emit('message', `欢迎进入${this.socket.data.user.name} 进入房间 ${this.roomId}`)
        } catch (err) {
            logger.error('加入房间异常')
            console.log(err)
        }
    }

    public async handlerMessage(msg, cb) {
        // console.log('client sent msg: ' + msg)
        // 向房间所有人发送消息（包括自己）
        if (msg.to) {
            const toSocketId = await Cache.hget(this.cachePrefixUserIdKey + msg.to, 'socket_id')
            if (toSocketId) {
                // const toSocket = await this.io.in(toSocketId).fetchSockets();
                // if (toSocket.length > 0) {
                //     toSocket[0].emit('message', msg.content)
                //     return
                // }
                this.socket.to(toSocketId).emit('message', msg.content)
                return
            }
            throw new Error("发送消息对象未找到")
        }
        this.io.volatile.to(this.userInfo.room).emit('message', msg.content)
    }

    public async handlerConcurrent(msg, cb) {
        try {
            await Cache.zincrby(this.cacheZListKey, parseInt(msg) || 0, this.socket.id)
        } catch(err) {
            console.log(err)
        }
        // console.log('client sent msg: ' + msg)
        // 向房间所有人发送消息（包括自己）
        // this.io.to(this.roomId).emit('message', msg)
    }
    
    public async showRank() {
        if (!this.timer) {
            this.timer = setInterval(async () => {
                const res = await Cache.zrange(this.cacheZListKey, 0, 10)
                const rank = chunk(res, 2)
                this.io.to(this.roomId).emit('rank', rank)
            }, 1000)
        } else {
            clearInterval(this.timer)
            this.timer = null
        }
    }
    public async clearRank() {
        await Cache.del(this.cacheZListKey)
    }
}