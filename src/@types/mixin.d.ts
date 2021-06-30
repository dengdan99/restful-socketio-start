import { Server } from 'socket.io';

declare module "koa" {
    export interface BaseContext {
        io: Server
    }
}