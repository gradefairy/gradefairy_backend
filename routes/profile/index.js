const express = require('express');
const sanitizehtml = require('sanitize-html');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const connection = require('../../dbconnection');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();
const ERROR = 404;
const SUCCESS = 200;

router.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));

const passport = require('passport');
const LocalStorage = require('passport-local').Strategy;

router.use(cookieParser());
router.use(passport.initialize());
router.use(passport.session());

connection.getConnection((err, conn) => {
    if(err) console.error(err.message);
});

const base64crypto = password => crypto.createHash('sha512').update(password).digest('base64');

// 로그인 성공시 session storage에 로그인한 정보 저장
passport.serializeUser((user, done) => {
    console.log(user.id);
    done(null, user.id);
});

// 페이지 방문마다 호출해서 로그인 여부 확인
passport.deserializeUser((id, done) => {
    const sql = 'SELECT * FROM `member` WHERE id=?;';
    connection.query(sql, [id], (err, result) => {
        if(err) console.log(err.message);
        console.log("deserializeUser mysql result: " , result);
        const userinfo = JSON.parse(JSON.stringify(result[0]));
        done(null, userinfo);
    });
});

passport.use(new LocalStorage(
    {
        usernameField: 'id',
        passwordField: 'pw'
    },
    (username, password, done) => {
        console.log('LocalStrategy', username, password);
        const sql = 'SELECT * FROM `member` WHERE id=? AND `pw`=?;';
        connection.query(sql, [username, base64crypto(password)], (err, result) => {
            if(err) console.log(err.message);
            if(result.length === 0) {
                console.log("no user");
                return done(null, false, {
                    'message': 'Incorrect'
                });
            } else {
                console.log(result);
                const userinfo = JSON.parse(JSON.stringify(result[0]));
                return done(null, userinfo);
            }
        })
    }
));

// 로그인
router.post('/login', (req, res) => {
    console.log(req.body);
    passport.authenticate('local', { successRedirect: '/profile/success', failureRedirect: '/profile/login', failureFlash: false});
});

// 로그인 성공
router.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, '/../../html/main.html'));
})

// 로그인 페이지
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/../../html/login.html'));
});

// 로그아웃
router.get('/logout', (req, res) => {
    req.logout();
    req.session.save((err) => {
        if(err) {
            console.log(err.message);
            res.json({
                code: ERROR,
                message: 'logout fail'
            })
        }
        res.json({
            code: SUCCESS,
            message: 'logout success'
        });
    })
    
});

router.get('/test', (req, res) => {
    const sql = 'SELECT * FROM `member` where id=?;'

    connection.query(sql, ["abc"], (err, result) => {
        if(err) {
            console.log(err.message);
            res.json({
                'code': ERROR,
                'message': err.message
            })
        } else {
            console.log(result);
            res.json({
                'code': SUCCESS,
                'message': '',
                'data': result
            })
        }
    });
})

// 현재 로그인한 유저 정보 반환
router.get('/get', (req, res) => {
    const id = req.user.id;
    const sql = 'SELECT * FROM `member` WHERE id=?;'

    connection.query(sql, [id], (err, result) => {
        if(err) {
            console.log(err.message);
            res.json({
                'code': ERROR,
                'message': err.message
            })
        } else {
            console.log(result);
            const userinfo = JSON.parse(JSON.stringify(result[0]));
            res.json({
                'code': SUCCESS,
                'message': '',
                'data': userinfo
            })
        }
    });
});

// 현재 로그인한 유저 탈퇴
router.delete('/delete', (req, res) => {
    const id = req.user.id;
    const sql = 'DELETE FROM `member` WHERE id=?;';

    connection.query(sql, [id], (err, _) => {
        if(err) {
            console.log(err.message);
            res.json({
                'code': ERROR,
                'message': err.message
            })
        } else {
            console.log(_);
            res.json({
                'code': SUCCESS,
                'message': ''
            })
        }
    })
});

// 수정할 정보 받아서 현재 로그인한 유저 정보 수정
router.put('/put', (req, res) => {
    const id = req.user.id;
    const filtering = req.body.filtering;

    const sql = 'UPDATE `member` SET filtering=? WHERE id=?;';
    const params = [filtering, id];

    connection.query(sql, params, (err, _) => {
        if(err) {
            console.log(err.message);
            res.json({
                'code': ERROR,
                'message': err.message
            })
        }
    })
});

// 회원가입 정보 받아서 회원가입
router.post('/post', (req, res) => {
    const id = sanitizehtml(req.body.id);
    const pw = base64crypto(sanitizehtml(req.body.pw));
    const name = sanitizehtml(req.body.name);
    const filtering = req.body.filtering;

    const sql = 'INSERT INTO `member` (id, `pw`, name, filtering) VALUES (?, ?, ?, ?);';
    const params = [id, pw, name, filtering];

    connection.query(sql, params, (err, _) => {
        if(err) {
            console.log(err);
            res.json({
                'code': ERROR,
                'message': err.message
            });
        } else {
            res.json({
                'code': SUCCESS,
                'message': ''
            })
        }
    })
});

module.exports = router;