import { Request, Response, NextFunction } from 'express'

const jwt = require('jsonwebtoken')

// ! The middleware used for checking the jwt tokens sent in requests
// ? It takes the Authorization Token which looks like: "Bearer XXXXXXXXXXX"
// ? The token gets divided and is verified in two parts
// ? The first part being "Bearer", if it doesn't look like it, then it returns a failiure
// ? If it's correct, it continues and checks the Token
// ? If the token is bad, it redirects to the refresh token path, since the request had a good, but expired token
// !!!! After getting a new token, the request will need to be sent again
function jwtAuth(req: Request, res: Response, next: NextFunction) {
    const bearerHeader = req.headers.authorization

    if (!bearerHeader) {
        console.log('No bearer token.')
        res.status(403).end()
        return res
    }

    const parts = bearerHeader?.split(' ')

    if (parts.length != 2) {
        res.status(403).end()
        return res
    }

    if (parts[0] != 'Bearer') {
        res.status(403).end()
        return res
    }

    const token = parts[1]

    try {
        jwt.verify(token, process.env.MY_SECRET)

        next()
    } catch (err) {
        console.log('Token invalid.')
        res.status(498).end()
        return res
    }
}

module.exports = jwtAuth
