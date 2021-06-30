import config from 'config'
import { createConnection, ConnectionOptions } from "typeorm";
import 'reflect-metadata'

import { generateSeed } from './seed'
import { socketServer } from './socket'
import { httpServer } from './http'
import { logger } from './utils/logger';
import { Cache } from './utils/cache';
import { RedisClient } from 'redis';

const isPordMode = process.env.NODE_ENV == "production"

logger.info('env: ' + process.env.NODE_ENV)
const connectionOptions: ConnectionOptions = {
    type: 'mysql',
    host: config.get('db.host'),
    port: config.get('db.port'),
    username: config.get('db.username'),
    password: config.get('db.password'),
    database: config.get('db.database'),
    entityPrefix: config.get('db.tablePrefix'),
    synchronize: true,
    logging: false,
    entities: isPordMode ? ['dist/entity/**/*.js'] : ['src/entity/**/*.ts'],
    ssl: false,
    migrations: isPordMode ? ['dist/migrations/**/*.js'] : ['src/migrations/**/*.ts'],
    extra: {}
}

async function main() {
    // 链接数据库
    try {
        await createConnection(connectionOptions)
        logger.info('mysql connect successful')
    } catch (error) {
        logger.error("TypeORM connection error: ", error)
        process.exit()
    }

    // 链接redis
    let redisClient: RedisClient
    try {
        redisClient = await Cache.init()
        logger.info('redis connect successful' )
    } catch (error) {
        logger.error('redis connect error:' + error)
        process.exit()
    }

    // 冷启动的一些种子数据
    await generateSeed()

    // 配置KOA 服务器
    const app = httpServer()

    // 提取htpp 服务
    const server = require('http').createServer(app.callback())

    // 配置socketIo 服务器
    await socketServer(server, redisClient, app)

    // 打开端口 服务开始
    const prot = process.env.PORT || config.get('http.port')
    server.listen(prot, () => {
        logger.info(`Server running on port ${prot}`)
    })
 
    process.on('SIGINT', () => {
        logger.info(`Server is exit !!`)
        process.exit()
    })
}

main()
