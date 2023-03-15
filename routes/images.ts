import { Router, Request, Response } from 'express'
import { handleNotFound } from '../misc/errorHandlers'

const express = require('express')
const router: Router = express.Router()
const path = require('path')

router.route('/foods/:filename').get((req: Request, res: Response) => {
    if (!req.params.filename) {
        handleNotFound(res, 'No params given.')
        return
    }
    if (!require.main?.filename) {
        handleNotFound(res, 'No filename given.')
        return
    }

    res.status(200)
    res.sendFile(
        require.main.filename +
            path.dirname(+`/public/images/foods/${req.params.filename}`)
    )
})

module.exports = router
