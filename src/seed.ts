import { getManager, Repository } from "typeorm"
import { Master } from "./entity/master"
import { logger } from "./utils/logger"

const seedMaster = {
    name: 'leo',
    mobile: '13666666666',
    password: '123456'
}

export const generateSeed = async function () {
    const masterRepository: Repository<Master> = getManager().getRepository(Master)

    const count = await masterRepository.count()
    if (count > 0) {
        return
    } else {
        logger.info('植入种子数据')
        const _master = new Master()
        _master.name = seedMaster.name
        _master.password = seedMaster.password
        _master.mobile = seedMaster.mobile
        await masterRepository.save(_master)
    }
}