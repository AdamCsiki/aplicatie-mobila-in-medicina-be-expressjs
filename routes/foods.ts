import { query, Request, Response, Router } from 'express'
import { MysqlError } from 'mysql'
import FoodModel from '../models/FoodModel'
import {
    handleCustomError,
    handleMySqlError,
    handleNotFound,
} from '../misc/errorHandlers'

const connection = require('./../db/mysql')
const express = require('express')
const router: Router = express.Router()

// ! Global route for foods
// ? Has only one GET operation
router.route('/').get((req: Request, res: Response) => {
    const query = 'SELECT * FROM foods;'

    connection.query(query, (err: MysqlError, rows: any[]) => {
        if (err) {
            handleMySqlError(res, err)
            return
        }

        if (rows.length == 0) {
            handleNotFound(res, 'No foods have been found.')
            return
        }

        res.status(200)
        res.json(rows)
        return
    })
})

// ! Route for search queries
// ? Used for the search function of the app
router.route('/find').get((req: Request, res: Response) => {
    const query = 'SELECT * FROM foods WHERE name LIKE ?;'

    if (!req.query.search) {
        res.status(500)
        res.json({
            success: false,
            msg: 'No search query has been given.',
        })
        return
    }

    connection.query(
        query,
        ['%' + req.query.search + '%'],
        (err: MysqlError, rows: any[]) => {
            if (err) {
                handleMySqlError(res, err)
                return
            }

            if (rows.length == 0) {
                handleNotFound(
                    res,
                    `No food exists with the search query: ${req.query.search}`
                )
                return
            }

            res.status(200)
            res.json(rows)
        }
    )
})

// food by user id
router.route('/user/:id').get((req: Request, res: Response) => {
    const query = 'SELECT * FROM foods WHERE user_id=?'

    if (!req.params.id) {
        handleNotFound(res, 'No id.')
        return
    }

    connection.query(query, [req.params.id], (err: MysqlError, rows: any[]) => {
        if (err) {
            handleMySqlError(res, err)
            return
        }

        res.status(200)
        res.json(rows)
    })
})

// ! Route designated for use on only one object
router
    .route('/food')
    .get((req: Request, res: Response) => {
        const query = 'SELECT * FROM foods WHERE id = ?;'

        if (!req.query.id) {
            handleCustomError(res, 500, 'No id has been given.')
            return
        }

        connection.query(
            query,
            [req.query.id, req.body.user_id],
            (err: MysqlError, rows: any[]) => {
                if (err) {
                    handleMySqlError(res, err)
                    return
                }

                if (rows.length == 0) {
                    handleNotFound(
                        res,
                        `No food with id ${req.query.id} has been found.`
                    )
                    return
                }

                const food: FoodModel = rows[0]

                res.status(200)
                res.json(food)
            }
        )
    })
    .put((req: Request, res: Response) => {
        const getQuery = 'SELECT * FROM foods WHERE id = ?;'
        const postQuery = 'INSERT INTO foods (name, user_id) VALUES (?, ?)'
        const putQuery = 'UPDATE foods SET name = ? WHERE id = ?;'

        // ! Checking if the id is given
        if (!req.query.id) {
            handleCustomError(res, 500, 'No id has been given.')
            return
        }

        const updatedFood: FoodModel = req.body

        // ! Making sure the not nullable attributes are not missing
        if (!updatedFood.name || !updatedFood.user_id) {
            handleCustomError(res, 500, 'Food name or user_id invalid.')
            return
        }

        connection.query(
            getQuery,
            [req.query.id],
            (err: MysqlError, rows: any[]) => {
                if (err) {
                    handleMySqlError(res, err)
                    return
                }

                if (rows.length == 0) {
                    connection.query(
                        postQuery,
                        [updatedFood.name, updatedFood.user_id],
                        (err: MysqlError) => {
                            if (err) {
                                handleMySqlError(res, err)
                                return
                            }

                            res.status(201)
                            res.json({
                                success: true,
                                msg: 'Created a new food.',
                            })
                        }
                    )
                    return
                }

                if (rows[0].user_id != updatedFood.user_id) {
                    handleCustomError(res, 401, "User id's do not match.")
                    return
                }

                connection.query(
                    putQuery,
                    [updatedFood.name, req.query.id],
                    (err: MysqlError) => {
                        if (err) {
                            handleMySqlError(res, err)
                            return
                        }

                        res.status(200)
                        res.json({
                            success: true,
                            msg: `Food with id ${req.query.id} has been updated.`,
                        })
                    }
                )
            }
        )
    })
    .delete((req: Request, res: Response) => {
        const deleteQuery = 'DELETE FROM foods WHERE id = ? LIMIT 1;'

        if (!req.query.id) {
            handleCustomError(res, 401, 'No id has been given.')
            return
        }

        connection.query(deleteQuery, [req.query.id], (err: MysqlError) => {
            if (err) {
                handleMySqlError(res, err)
                return
            }

            res.status(200)
            res.json({
                success: true,
                msg: `Food with id ${req.query.id} has been deleted.`,
            })
        })
    })

module.exports = router
