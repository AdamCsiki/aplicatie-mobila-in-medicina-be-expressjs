import { Response, Request, Router } from "express";
import { FieldInfo, MysqlError } from "mysql";
import { handleMySqlError, handleNotFound } from "../misc/errorHandlers";

const connection = require("../db/mysql");

const cookieJwtAuth = require("../middleware/jwtAuth");

const express = require("express");
const router: Router = express.Router();

router.route("/").get((req: Request, res: Response) => {
  connection.query("SELECT * FROM users;", (err: MysqlError, rows: any) => {
    if (err) {
      handleMySqlError(res, err);
      return;
    }

    if (rows.length == 0) {
      handleNotFound(res, "Users do not exist.");
    }

    res.status(200);
    res.json(rows);
  });
});

router
  .route("/user")
  .get((req: Request, res: Response) => {
    const query = "SELECT * FROM users WHERE id = ?";

    connection.query(query, [req.query.id], (err: MysqlError, rows: any) => {
      if (err) {
        handleMySqlError(res, err);
      }

      if (rows.length == 0) {
        handleNotFound(res, "User does not exist.");
      }

      res.status(200);
      res.json({
        user: rows[0],
      });
    });
  })
  .put((req: Request, res: Response) => {
    res.send(`Update user with ID: ${req.params.id}`);
  })
  .delete((req: Request, res: Response) => {
    res.send(`Delete user with ID: ${req.params.id}`);
  });

module.exports = router;
