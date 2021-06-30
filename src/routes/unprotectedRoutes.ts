import Router from '@koa/router';
import { general } from '../controllers';

const unprotectedRouter = new Router();

unprotectedRouter.get('/', general.helloWorld);
unprotectedRouter.post('/general/login', general.login);

export { unprotectedRouter };
