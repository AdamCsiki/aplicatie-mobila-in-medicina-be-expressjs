import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";
import FoodModel from "../models/FoodModel";
import foodModel from "../models/FoodModel";

const connection = require("./../db/mysql");
const express = require("express");
const router: Router = express.Router();

// ! Global route for foods
// ? Has only one GET operation
router.route("/").get((req: Request, res: Response) => {
  const query = "SELECT * FROM foods;";

  connection.query(query, (err: MysqlError, rows: any[]) => {
    if (err) {
      res.status(501);
      res.json({
        success: false,
        error: err,
      });
      return;
    }

    if (rows.length == 0) {
      res.status(404);
      res.end();
      return;
    }

    res.status(200);
    res.json({
      rows,
    });
    return;
  });
});

// ! Route for search queries
// ? Used for the search function of the app
router.route("/find").get((req: Request, res: Response) => {
  const query = "SELECT * FROM foods WHERE name LIKE ?";

  if (!req.query.search) {
    res.status(500);
    res.json({
      success: false,
      msg: "No search query has been given.",
    });
  }

  connection.query(
    query,
    ["%" + req.query.search + "%"],
    (err: MysqlError, rows: any[]) => {
      if (err) {
        res.status(500);
        res.json({
          success: false,
          error: err,
        });
        return;
      }

      if (rows.length == 0) {
        res.status(404);
        res.json({
          success: false,
          msg: `No food exists with the search query: ${req.query.search}`,
        });
        return;
      }

      res.status(200);
      res.json({
        rows,
      });
    }
  );
});

// ! Route designated for use on only one object
router
  .route("/food")
  .get((req: Request, res: Response) => {
    const query = "SELECT * FROM foods WHERE id = ? LIMIT 1";

    if (!req.query.id) {
      res.status(500);
      res.json({ success: false, msg: "No id has been given." });
      return;
    }

    connection.query(query, [req.query.id], (err: MysqlError, rows: any[]) => {
      if (err) {
        res.status(500);
        res.json({
          success: false,
          error: err,
        });
        return;
      }

      if (rows.length == 0) {
        res.status(404);
        res.json({
          success: false,
          msg: `No food with id ${req.query.id} has been found.`,
        });
        return;
      }

      res.status(200);
      res.json({
        food: rows[0],
      });
    });
  })
  .post((req: Request, res: Response) => {
    const query = "INSERT INTO foods (name, user_id) VALUES (?, ?)";

    const newFood: FoodModel = req.body;

    connection.query(
      query,
      [newFood.name, newFood.user_id],
      (err: MysqlError) => {
        if (err) {
          res.status(500);
          res.json({
            success: false,
            error: err,
          });
          return;
        }

        res.status(200);
      }
    );
  })
  .patch((req: Request, res: Response) => {
    const query = "UPDATE foods SET name = ? WHERE id = ?";

    if (!req.query.id) {
      res.status(500);
      res.json({
        success: false,
        msg: "No id has been given.",
      });
      return;
    }

    const updatedFood: FoodModel = req.body;

    connection.query(
      query,
      [updatedFood.name, req.query.id],
      (err: MysqlError) => {
        if (err) {
          res.status(500);
          res.json({ success: false, error: err });
          return;
        }

        res.status(200);
        res.json({
          success: true,
          msg: `Food with id ${req.query.id} has been updated.`,
        });
      }
    );
  });

module.exports = router;
