import { SwaggerRouter } from "koa-swagger-decorator"
import { master } from "../controllers"
import path from 'path'

const isPordMode = process.env.NODE_ENV == "production"
const protectedRouter = new SwaggerRouter()


protectedRouter.get('/managers', master.getMasters)
protectedRouter.post('/manager', master.createMaster)
protectedRouter.get('/managers/:id', master.getMaster)

if (!isPordMode) {
    protectedRouter.swagger({
        title: '接口文档',
        description: '描述',
        version: '1.2.3'
    })
    protectedRouter.mapDir(path.resolve(__dirname, '../controllers/'))
}


export { protectedRouter }