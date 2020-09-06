module.exports = (router) => {
    const cookieParser = require('cookie-parser');
    const session = require('express-session');
    const passport = require('passport');
    const LocalStorage = require('passport-local').Strategy;
    const connection = require('../dbconnection');
    router.use(session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            secure: false,
        }
    }));

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
            const userinfo = JSON.parse(JSON.stringify(result[0]));
            console.log(userinfo)
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
            connection.query(sql, [username, password], (err, result) => { // 나중에 암호화해주기
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
    return passport;
}

