import { BodyParser } from 'body-parser'
import { NextFunction, Request, Response } from 'express'

const express = require('express')

const bodyParser: BodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const cors = require('./config/cors')
const logger = require('./middleware/logger')
const process = require('process')
const jwtAuth = require('./middleware/jwtAuth')

const PORT = 3000
process.env.MY_SECRET = 'secret'
process.env.MY_SECRET_REFRESH = 'refreshingsecret'

const app = express()

// ! BEFORE READING ANY COMMENTS MAKE SURE TO INSTALL THE Improved Comments PLUGIN

// !
// ! Express setup begins here
// !

// * Global headers set up here
// ? The global headers are set up in this file because I could not find a way to put it in another file without being similar
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header({
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
        Accept: '*/*',
    })
    // ! if error about header set after it was sent, it means that two responses were sent
    next()
})

// ? Body parser is used in order for the body of the request to be used, otherwise it is always undefined.
// ? Logger is used for logging when requests are made
// ? Cors is used in order to set up Cross Origin requests
// ? CookieParser is used for the JWToken requests
// ? Public is exposed staticly for absolutely no reason, it's just one line, won't hurt right?
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(logger)
app.use(cors())
app.use(cookieParser())

// ! Routes begin here
// ? User route handles all the requests for the user table
// ? Product route handles all the requests for the products table
// ? Auth route handles the login and register features of the application
const userRouter = require('./routes/users')
const foodRouter = require('./routes/foods')
const authRouter = require('./routes/auth')
const uploadRouter = require('./routes/upload')
const imageRouter = require('./routes/images')

// ! Applying the routes and the route specific middleware
// ? Almost all routes use cookieJwtAuth to check if a token is present on the request
// app.use('/users', jwtAuth)
app.use('/users', userRouter)
//
app.use('/foods', jwtAuth)
app.use('/foods', foodRouter)
// ? Authorization routes don't use JWT tokens
app.use('/auth', authRouter)
app.use('/noauth', express.static('public/noauth.html'))
//
app.use('/upload', jwtAuth)
app.use('/upload', uploadRouter)
//
const options = require('./config/staticOptions')
app.use('/images/foods', express.static('public/images/foods', options))
app.use('/images/users', express.static('public/images/users', options))

// ! Express Server starts here
// ? It clears the console on start to stop text spam
// ? Shows the port and gives a link for ease of access
app.listen(PORT, () => {
    console.clear()
    console.log(`CORS-enabled web server listening on port ${PORT}`)
    console.log(`Link is here: http://localhost:${PORT}`)
})
