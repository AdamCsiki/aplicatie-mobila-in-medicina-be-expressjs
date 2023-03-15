import { Request, Response, NextFunction } from 'express'

// ! Logging function
// ? It logs every request made in the console
// ? It is used mostly to make sure that a request I made is actually sent
function logger(req: Request, res: Response, next: NextFunction) {
    console.log({
        request_host: req.get('host'),
        headers: req.headers,
        body: req.body,
    })
    next()
}

module.exports = logger
