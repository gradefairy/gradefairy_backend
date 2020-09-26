const express = require("express");
const sanitizehtml = require("sanitize-html");
const router = express.Router();
const crypto = require("crypto");
const path = require("path");
const connection = require("../../dbconnection");
const passport = require("../../lib/passport")(router);
require("dotenv").config();
const ERROR = 404;
const SUCCESS = 200;

connection.getConnection((err, conn) => {
    if (err) console.error(err.message);
});

const base64crypto = password =>
    crypto
        .createHash("sha512")
        .update(password)
        .digest("base64");

// 로그인
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) console.log(err.message);
        if (!user) return res.send({ code: ERROR, message: "not logined" });
        req.logIn(user, err => {
            if (err) return next(err);
            return res.redirect("/profile/success");
        });
    })(req, res, next);
});

// 로그인 성공
router.get("/success", (req, res) => {
    res.json({
        code: SUCCESS
    });
});

// 로그인 페이지, 나중에 삭제
router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "/../../html/login.html"));
});

// 로그아웃
router.get("/logout", (req, res) => {
    req.logout();
    req.session.save(err => {
        if (err) {
            console.log(err.message);
            res.json({
                code: ERROR,
                message: "logout fail"
            });
        }
        res.json({
            code: SUCCESS,
            message: "logout success"
        });
    });
});

// 현재 로그인한 유저 정보 반환
router.get("/get", (req, res) => {
    const id = req.user.id;
    const sql = "SELECT * FROM `member` WHERE id=?;";

    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err.message);
            res.json({
                code: ERROR,
                message: err.message
            });
        } else {
            console.log(result);
            const userinfo = JSON.parse(JSON.stringify(result[0]));
            res.json({
                code: SUCCESS,
                message: "",
                data: userinfo
            });
        }
    });
});

// 현재 로그인한 유저 탈퇴
router.delete("/delete", (req, res) => {
    const id = req.user.id;
    const sql = "DELETE FROM `member` WHERE id=?;";

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

// 수정할 정보 받아서 현재 로그인한 유저 정보 수정
router.put("/put", (req, res) => {
    const id = req.user.id;
    const filtering = req.body.filtering;

    const sql = "UPDATE `member` SET filtering=? WHERE id=?;";
    const params = [filtering, id];

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

// 회원가입 정보 받아서 회원가입
router.post("/post", (req, res) => {
    const id = req.body.id;
    const pw = base64crypto(sanitizehtml(req.body.pw));
    const name = sanitizehtml(req.body.name);
    const filtering = req.body.filtering;

    const sql = "INSERT INTO `member` (id, `pw`, name, filtering) VALUES (?, ?, ?, ?);";
    const params = [id, pw, name, filtering];

    connection.query(sql, params, (err, _) => {
        if (err) {
            console.log(err);
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
