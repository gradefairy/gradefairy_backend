const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mainRouter = require('./routes/main');
const loginRouter = require('./routes/login');
const calendarRouter = require('./routes/calendar');
const mypageRouter = require('./routes/mypage');
const noticeRouter = require('./routes/notice');
const port = 3000;

app.use(express.static(path.join(__dirname, 'static')));; // static폴더 안에 있는 파일들 쓰기 위해
app.use(bodyParser.urlencoded({ extended: false})); // bodyParser 쓰려고 적어주는거

app.use('/', mainRouter);
app.use('/login', loginRouter);
app.use('/calendar', calendarRouter);
app.use('/mypage', mypageRouter);
app.use('/notice', noticeRouter);

app.listen(port, () => { console.log(`Server is running on port ${port}`)}); // 3000번 포트로 서버 열어주기