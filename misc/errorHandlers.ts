import { MysqlError } from "mysql";
import { Response } from "express";

function handleMySqlError(res: Response, err: MysqlError) {
  res.status(500);
  res.json({
    success: false,
    error: err,
  });
}

function handleNotFound(res: Response, msg: String) {
  res.status(404);
  res.json({
    success: false,
    msg: msg,
  });
}

function handleCustomError(res: Response, code: number, msg: String) {
  res.status(code);
  res.json({
    success: false,
    msg: msg,
  });
}

export { handleMySqlError, handleNotFound, handleCustomError };
