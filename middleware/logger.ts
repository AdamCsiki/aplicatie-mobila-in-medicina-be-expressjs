import { Request, Response, NextFunction } from 'express'

// ! Logging function
// ? It logs every request made in the console
// ? It is used mostly to make sure that a request I made is actually sent
function logger(req: Request, res: Response, next: NextFunction) {
    let currentdate = new Date()
    let datetime =
        currentdate.getDate() +
        '/' +
        (currentdate.getMonth() + 1) +
        '/' +
        currentdate.getFullYear() +
        ' @ ' +
        currentdate.getHours() +
        ':' +
        currentdate.getMinutes() +
        ':' +
        currentdate.getSeconds()
    console.log('-----------------------New Request-----------------------')
    console.log('Date: ', datetime)
    console.log({
        request_host: req.get('host'),
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body,
    })
    next()
}

module.exports = logger
