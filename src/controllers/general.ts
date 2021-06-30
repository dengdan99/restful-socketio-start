import { BaseContext, Context } from 'koa';
import { body, description, request, summary } from 'koa-swagger-decorator'
import jwt from 'jsonwebtoken'
import config from 'config'
import { getManager, Repository } from 'typeorm';
import { Master } from '../entity/master';
import { responseError, responseSuccess } from '../utils/response';

export interface LoginForm extends Record<string, unknown> {
    name: string
    password: string
}

export default class GeneralController {

    @request('get', '/')
    @summary('welcome')
    @description('不需要验证的权限的接口')
    public static async helloWorld(ctx: BaseContext): Promise<void> {
        ctx.io.volatile.to('room_1').emit('message', 'this msg from restful')
        responseSuccess(ctx, 'hello world')
    }


    @request('post', '/general/login')
    @summary('用户登陆 种植数据 账号： leo, 密码： 123456')
    @body({
        name: { type: 'string', required: true, description: '用户名' },
        password: { type: 'string', required: true, description: '密码' },
    })
    public static async login(ctx: Context): Promise<void> {
        const user = ctx.request.body as LoginForm
        if (user.password && user.name) {

            const masterRep: Repository<Master> = getManager().getRepository(Master)
            const master = await masterRep.findOne({name: user.name, password: user.password})

            if (master) {
                const userToken = {
                    mobile: master.mobile,
                    name: master.name,
                    id: master.id
                }
                const token = jwt.sign(userToken, config.get('jwt.secret'), { expiresIn: config.get('jwt.expires') })
                responseSuccess(ctx, { token }, '登陆成功')
            } else {
                responseError(ctx, '账户不存在或密码错误')
            }
            
        } else {
            responseError(ctx, '参数错误')
        }
    }
}