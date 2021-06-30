import { RedisClient } from "redis";
import config from 'config'
import { logger } from "./logger";

/**
 * https://www.jianshu.com/p/036e6c79c70e
 */

export class Cache {

    static cacheClient: RedisClient
    static prefix = config.get('redis.prefix')

    public static init():Promise<RedisClient> {
        // 链接redis （redis在该系统中不仅仅作为缓存使用， 还提供sockeio提供订阅推送服务）
        const redisClient = new RedisClient({
            host: config.get('redis.host'),
            port: config.get('redis.port'),
            connect_timeout: 1000
        })
        return new Promise((resolve, reject) => {
            this.cacheClient = redisClient
            redisClient.on('connect', (opts) => {
                resolve(redisClient)
            })
            redisClient.on('error', (error) => {
                reject(error)
            })
        })
    }

    // 获取缓存
    public static get(keys: string | string[]):Promise<any> {
        return new Promise((resolve, reject) => {
            let fn = 'get'
            let _keys: string | string[]
            if (Array.isArray(keys)) {
                fn = 'mget'
                _keys = keys.map(k => (this.prefix + k))
            } else {
                _keys = this.prefix + keys 
            }
            this.cacheClient[fn](_keys, (err, reply) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(reply)
                }
            })
        })
    }
    // 设置缓存
    public static set(key: string, value: string):Promise<void> {
        return new Promise((resolve, reject) => {
            this.cacheClient.set(this.prefix + key, value, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
    // 删除缓存
    public static del(key: string):Promise<void> {
        return new Promise((resolve, reject) => {
            this.cacheClient.del(this.prefix + key, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }


    // 哈希字段赋值
    public static hset(key: string, field: string | {[key: string]: string}, value?: string):Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof field === 'object') {
                this.cacheClient.hmset(this.prefix + key, field, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            } else {
                this.cacheClient.hset(this.prefix + key, field, value, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            }
            
        })
    }

    // 哈希字段赋值
    public static hget(key: string, field: string):Promise<string> {
        return new Promise((resolve, reject) => {
            this.cacheClient.hget(this.prefix + key, field, (err, replay) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(replay)
                }
            })
        })
    }


    // 批量模糊删除 如 ‘user’ 后段模糊匹配
    public static mdel(key: string):Promise<void> {
        return new Promise((resolve, reject) => {
            this.cacheClient.keys(this.prefix + key + '*', (err, replay) => {
                if (err) {
                    reject(err)
                } else {
                    if (replay.length > 0) {
                        this.cacheClient.del(replay, (err) => {
                            if (err) {
                                reject(err)
                            } else {
                                resolve()
                            }
                        })
                    } else {
                        resolve()
                    }
                }
            })
        })
    }

    /**
     * 累加操作， redis的原子性操作
     * @param key 
     * @param increment 
     * @returns 
     */
    public static incrby(key: string, increment: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.cacheClient.incrby(this.prefix + key, increment, (err, num) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(num)
                }
            })
        })
    }

    /**
     * 累减操作， redis的原子性操作
     * @param key 
     * @param increment 
     * @returns 
     */
    public static decrby(key: string, increment: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.cacheClient.decrby(this.prefix + key, increment, (err, num) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(num)
                }
            })
        })
    }
 
    /**
     * 模糊查询 key的数量
     * @param startStr 起始的key字符
     * @returns 数量
     */
    public static keyLenght(startStr: string):Promise<number> {
        return new Promise((resolve, reject) => {
            this.cacheClient.keys(this.prefix + startStr + '*', (err, replay) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(replay.length)
                }
            })
        })
    }


    // 有序集合存入
    public static zadd(listKey: string, num: number, childKey: string):Promise<void> {
        return new Promise((resolve, reject) => {
            this.cacheClient.zadd(this.prefix + listKey, num, childKey, (res) => {
                if (res) {
                    reject(res)
                } else {
                    resolve()
                }
            })
        })
    }

    // 有序集合做累加
    public static zincrby(listKey: string, num: number, childKey: string):Promise<void> {
        return new Promise((resolve, reject) => {
            this.cacheClient.zincrby(this.prefix + listKey, num, childKey, (res) => {
                if (res) {
                    reject(res)
                } else {
                    resolve()
                }
            })
        })
    }

    // 有序集合取出 (降序)
    public static zrange(listKey: string, startIndex: number, endIndex: number):Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.cacheClient.zrevrange(this.prefix + listKey, startIndex, endIndex, 'withscores', (err, replay) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(replay)
                }
            })
        })
    }
}