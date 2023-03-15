import { Express } from 'express'

declare global {
    namespace NodeJS {
        interface Global {
            __EXPRESS_APP__: Express
            __root_app_path: string
        }
    }
}
