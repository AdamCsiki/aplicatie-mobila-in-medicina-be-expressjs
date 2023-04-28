import { Response, Request, Router } from 'express'
import LoginUser from '../models/LoginUser'
import process from 'process'
import { MysqlError } from 'mysql'
import RegisterUser from '../models/RegisterUser'
import {
    handleCustomError,
    handleMySqlError,
    handleNotFound,
} from '../misc/errorHandlers'

const connection = require('../db/mysql')

const express = require('express')
const jwt = require('jsonwebtoken')
const router: Router = express.Router()

const encoder = require('../misc/encription')

function createToken(email: String) {
    const token = jwt.sign({ email: email }, process.env.SECRET_KEY, {
        expiresIn: '5m', // ! CHANGE IT BACK TO 5 MINUTES AFTER DEVELOPMENT
    })

    const refreshToken = jwt.sign(
        { email: email },
        process.env.SUPER_SECRET_KEY,
        { expiresIn: '90d' }
    )

    return { token: token, refreshToken: refreshToken }
}

// ! POST route for Login
router.post('/signin', (req: Request, res: Response) => {
    if (!(req.body.email && req.body.password)) {
        res.status(401)
        res.json({
            success: false,
            msg: 'Forbidden.',
        })
        return
    }

    const loginUser: LoginUser = req.body

    // ? Query for checking if the user exists
    // ? Using placeholder ? to prevent sql injection
    const query = 'SELECT id, pass FROM users WHERE email = ? LIMIT 1;'

    connection.query(
        query,
        [loginUser.email],
        (err: MysqlError, rows: any[]) => {
            if (err) {
                handleMySqlError(res, err)
                return
            }

            if (rows.length == 0) {
                handleNotFound(res, 'No user with email found.')
                return
            }

            encoder.comparePassword(
                loginUser.password,
                rows[0].pass,
                (err: any, result: boolean) => {
                    if (err) {
                        console.log('Encoding error: ', err)
                    }

                    if (!result) {
                        handleCustomError(
                            res,
                            401,
                            'User credentials do not match.'
                        )
                        return
                    }

                    const { token, refreshToken } = createToken(loginUser.email)

                    res.clearCookie('refresh', { httpOnly: true })

                    res.cookie('refresh', refreshToken, { httpOnly: true })

                    res.status(200)

                    res.json({
                        success: true,
                        msg: 'User logged in successfully.',
                        token: token,
                        id: rows[0].id,
                    })
                    return
                }
            )
        }
    )
})

// ! POST route for SignUp
// ? First it checks if a user with the registered email exists
// ? If not then it makes another query to insert the new user
router.post('/signup', (req: Request, res: Response) => {
    const registerUser: RegisterUser = req.body

    const checkQuery = 'SELECT * FROM users WHERE email = ?'

    connection.query(
        checkQuery,
        [registerUser.email],
        (err: MysqlError, rows: any[]) => {
            if (rows.length != 0) {
                res.status(401)
                res.json('User already exists.')
                return
            }

            const currentDate = new Date()
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ')

            const query =
                'INSERT INTO users (email, pass, username, dateOfSignUp) VALUES (?, ?, ?, ?)'

            encoder.encryptPassword(
                registerUser.password,
                (err: any, hash: string) => {
                    registerUser.password = hash

                    connection.query(
                        query,
                        [
                            registerUser.email,
                            registerUser.password,
                            registerUser.username,
                            currentDate,
                        ],
                        (err: MysqlError) => {
                            if (err) {
                                res.status(401)
                                res.json({
                                    success: false,
                                    msg: err,
                                })
                                return
                            }

                            res.status(200)
                            res.json('User has been created.')
                        }
                    )
                }
            )
        }
    )
})

// ! GET route for requesting new Refresh and User Tokens
// ? Usually used automatically if the user has an expired token, but has a valid refresh token
router.get('/refresh', (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh

    if (refreshToken) {
        console.log(`Refresh token: Check\n${refreshToken}`)
        const jwtUser = jwt.verify(
            refreshToken,
            `${process.env.SUPER_SECRET_KEY}`
        )

        const token = jwt.sign(
            { email: jwtUser.email },
            `${process.env.SECRET_KEY}`,
            {
                expiresIn: '5m', // ! CHANGE IT BACK TO 5 MINUTES AFTER DEVELOPMENT
            }
        )

        const newRefreshToken = jwt.sign(
            { email: jwtUser.email },
            `${process.env.SUPER_SECRET_KEY}`,
            { expiresIn: '30d' }
        )

        res.removeHeader('set-cookie')
        res.clearCookie('refresh', { httpOnly: true })

        res.cookie('refresh', newRefreshToken, { httpOnly: true })

        res.json({
            success: true,
            msg: 'Refresh successful',
            token: token,
        })

        return
    }

    res.status(401).json({
        success: false,
        msg: 'Refresh unsuccessful',
    })
})

module.exports = router
