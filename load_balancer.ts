import { Response } from 'express'
import { AxiosResponse } from 'axios'

const express = require('express')
const path = require('path')
const load_balancer = express()
const axios = require('axios')

const servers = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
]

let current = 0

const handler = async (req: Request, res: Response) => {
    const { method, url, headers, body } = req

    const server = servers[current]

    current === servers.length - 1 ? (current = 0) : current++

    try {
        axios({
            url: `${server}${url}`,
            method: method,
            headers: headers,
            data: body,
        }).then((response: AxiosResponse) => {
            res.send(response.data)
        })
    } catch (err) {
        res.send(err)
    }
}

load_balancer.use((req: Request, res: Response) => {
    handler(req, res)
})

load_balancer.listen(8080)
