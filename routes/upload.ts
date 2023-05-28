import { query, Request, Response, Router } from 'express'
import { MysqlError } from 'mysql'
import {
    handleCustomError,
    handleMySqlError,
    handleNotFound,
} from '../misc/errorHandlers'
import { FileFilterCallback } from 'multer'

const connection = require('./../db/mysql')

const express = require('express')
const router: Router = express.Router()
const path = require('path')
const fs = require('fs')

const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req: Request, file: any, callback: any) => {
        callback(null, './public/images/foods/')
    },
    filename: (req: any, file: any, callback: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        callback(null, uniqueSuffix + path.extname(file.originalname))
    },
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 8000000 },
    fileFilter(req: Request, file: any, callback: FileFilterCallback) {
        if (!file) {
            return callback(null, false)
        }
        console.log(file)
        const filetypes = /jpeg|jpg|png/

        const extname = filetypes.test(path.extname(file.originalname))
        const mimetype = filetypes.test(file.mimetype)

        console.log({ extname, mimetype })

        return callback(null, extname && mimetype)
    },
})

const deleteFile = (type: string, filename: string) => {
    if (!require.main?.filename) {
        console.log(`Could not delete ${type}/${filename}`)
        return
    }
    fs.unlink(
        require.main.filename +
            path.dirname(+`/public/images/${type}/${filename}`)
    )
}

// ! THE MULTER SAVES FILES EVEN IF THE PATHS ARE NOT SAVED IN THE TABLE
router.put(
    '/image/food',
    upload.single('foodImage'),
    (req: any, res: Response) => {
        const query = 'UPDATE foods SET image_path = ? WHERE id = ?;'
        const food_id = req.query.id

        if (!req.file) {
            handleNotFound(res, 'File not found or type not valid.')
            return
        }

        if (!req.file.filename) {
            handleNotFound(res, 'File name not valid.')
            return
        }

        connection.query(
            query,
            ['/images/foods/' + req.file.filename, food_id],
            (err: MysqlError) => {
                if (err) {
                    handleMySqlError(res, err)
                    deleteFile('foods', 'req.file.filename')
                    return
                }

                res.status(200)
                res.json({
                    success: true,
                    msg: 'File added.',
                })
            }
        )
    }
)

module.exports = router
