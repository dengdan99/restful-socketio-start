import * as winston from 'winston'
import config from 'config'
import { transports, format } from 'winston'
import path from 'path'

const logFormat = format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)
const errFormat = format.printf((info) => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)

/**
 * 日志处理
 */
const logger = winston.createLogger({
    level: config.get('logger.level'),
    format: format.combine(
        format.label({ label: path.basename(process.mainModule.filename) }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
    transports: [
        // - 写入错误日志 `error.log`.
        new transports.File({
            filename: path.resolve(__dirname, '../../error.log'),
            level: 'error',
            format: format.combine(errFormat)
        }),
        // - Write to all logs with specified level to console.
        new transports.Console({
            format: format.combine(
                format.colorize(),
                logFormat,
            )
        })
    ]
})

export { logger }
