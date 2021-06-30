import { Context } from "koa";
import { body, path, request, responsesAll, summary, tagsAll } from "koa-swagger-decorator";
import { Master, masterSchema } from "../entity/master";
import { getManager, Repository } from "typeorm";
import { validate, ValidationError } from "class-validator";
import { LoginForm } from "./general";
import config from "config";
import { decodeJwt } from '../utils/auth'
import { responseError, responseSuccess } from "../utils/response";

@responsesAll({
    200: { description: 'success' },
    400: { description: 'bad request' },
})
@tagsAll(['masters'])
export default class MasterController {

    @request('get', '/masters')
    @summary('find all masters')
    public static async getMasters(ctx: Context): Promise<void> {
        
        const user = decodeJwt(ctx.headers.authorization, config.get('jwt.secret'))
        // 相当于获取DAO层
        const MasterRepository: Repository<Master> = getManager().getRepository(Master)

        // 查询
        const masters: Master[] = await MasterRepository.find()

        responseSuccess(ctx, masters)
    }

    @request('get', '/master/{id}')
    @summary('Find master by id')
    @path({
        id: { type: 'number', required: true, description: 'id of master' }
    })
    public static async getMaster(ctx: Context): Promise<void> {

        // get a master repository to perform operations with master
        const masterRepository: Repository<Master> = getManager().getRepository(Master);

        // load master by id
        const master: Master | undefined = await masterRepository.findOne(+ctx.params.id || 0);

        if (master) {
            responseSuccess(ctx, master)
        } else {
            responseError(ctx, '查无此人')
        }
    }

    @request("post", "/master")
    @summary("Create a master")
    @body(masterSchema)
    public static async createMaster(ctx: Context): Promise<void> {

        // get a master repository to perform operations with master
        const masterRepository: Repository<Master> = getManager().getRepository(Master);

        // build up entity master to be saved
        const masterToBeSaved: Master = new Master()
        masterToBeSaved.name = ctx.request.body['name']
        masterToBeSaved.password = ctx.request.body['password']
        masterToBeSaved.mobile = ctx.request.body['mobile']

        // validate master entity
        const errors: ValidationError[] = await validate(masterToBeSaved); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            responseError(ctx, errors.toString())
        } else if (await masterRepository.findOne({ where: [
            { mobile: masterToBeSaved.mobile },
            { name: masterToBeSaved.name }
        ] })) {
            responseError(ctx, '电话或者名字 有人注册过了')
        } else {
            // save the master contained in the POST body
            const master = await masterRepository.save(masterToBeSaved);
            responseSuccess(ctx)
        }
    }
}