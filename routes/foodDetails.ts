import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";
import FoodModel from "../models/FoodModel";
import {
  handleCustomError,
  handleMySqlError,
  handleNotFound,
} from "../misc/errorHandlers";

const connection = require("./../db/mysql");
const express = require("express");
const router: Router = express.Router();

router.route("/details").get((req: Request, res: Response) => {
  const checkQuery = "SELECT * FROM foods WHERE id = ? LIMIT 1;";
  const getQuery = "SELECT * FROM food_details WHERE food_id = ? LIMIT 1;";

  const food_id = req.query.id;

  connection.query(checkQuery, [food_id], (err: MysqlError, rows: any[]) => {
    if (err) {
      handleMySqlError(res, err);
      return;
    }

    if (rows.length == 0) {
      handleNotFound(res, `No food has been found with id: ${food_id}`);
      return;
    }

    connection.query(getQuery, [food_id], (err: MysqlError, rows: any[]) => {
      if (err) {
        handleMySqlError(res, err);
        return;
      }

      if (rows.length == 0) {
        handleNotFound(res, `Food with id ${food_id} has no details.`);
        return;
      }

      res.status(200);
      res.json({
        success: true,
        details: rows[0],
      });
    });
  });
});

module.exports = { router };
