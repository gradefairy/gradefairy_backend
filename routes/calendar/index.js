const express = require("express");
const sanitizehtml = require("sanitize-html");
const router = express.Router();
const connection = require("../../dbconnection");
const ERROR = 404;
const SUCCESS = 200;

connection.getConnection((err, conn) => {
    if (err) console.error(err.message);
});

// 현재 로그인한 사용자의 기간 내 캘린더 리스트 반환
router.get("/get/:startdate/:enddate", (req, res) => {
    const id = req.user.id;
    const startdate = req.params.startdate;
    const enddate = req.parans.enddate;
    const sql = "SELECT * FROM calendar WHERE mem_id=? AND dateTime BETWEEN ? AND ?;";
    const params = [id, startdate, enddate];

    connection.query(sql, params, (err, result) => {
        if (err) {
            console.log(err.message);
            res.json({
                code: ERROR,
                message: err.message
            });
        } else {
            console.log(result);
            const calendar = JSON.parse(JSON.stringify(result[0]));
            res.json({
                code: SUCCESS,
                message: "",
                data: calendar
            });
        }
    });
});

// 현재 로그인한 사용자의 캘린더에 새로운 일정 추가
router.post("/post", (req, res) => {
    const id = req.user.id;
    const dateTime = req.body.dateTime;
    const title = sanitizehtml(req.body.title);
    const content = sanitizehtml(req.body.content);
    const category = req.body.category;
    const sql = "INSERT INTO calendar(mem_id, dateTime, title, content, category) VALUES (?, ?, ?, ?, ?);";
    const params = [id, dateTime, title, content, category];

    connection.query(sql, params, (err, _) => {
        if (err) {
            console.log(err.message);
            res.json({
                code: ERROR,
                message: err.message
            });
        } else {
            res.json({
                code: SUCCESS,
                message: ""
            });
        }
    });
});

// 현재 로그인한 사용자의 일정 번호를 인자로 받아서 일정 수정
router.put("/put", (req, res) => {
    const calendarId = req.body.id;
    const dateTime = req.body.dateTime;
    const title = sanitizehtml(req.body.title);
    const content = sanitizehtml(req.body.content);
    const category = req.body.category;
    const sql = "UPDATE calendar SET dateTime=?, title=?, content=?, category=? WHERE id=?;";
    const params = [dateTime, title, content, category, id, calendarId];

    connection.query(sql, params, (err, _) => {
        if (err) {
            console.log(err.message);
            res.json({
                code: ERROR,
                message: err.message
            });
        } else {
            res.json({
                code: SUCCESS,
                message: ""
            });
        }
    });
});

// 현재 로그인한 사용자의 일정 번호를 인자로 받아서 일정 삭제
router.delete("/delete", (req, res) => {
    const id = req.body.id;
    const sql = "DELETE FROM calendar WHERE id=?;";

    connection.query(sql, [id], (err, _) => {
        if (err) {
            console.log(err.message);
            res.json({
                code: ERROR,
                message: err.message
            });
        } else {
            res.json({
                code: SUCCESS,
                message: ""
            });
        }
    });
});

module.exports = router;
