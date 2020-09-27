const cors = require("cors");
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const homeRouter = require('./routes/home');
const calendarRouter = require('./routes/calendar');
const profileRouter = require('./routes/profile');
const noticeRouter = require('./routes/notice');
const passport = require('./lib/passport')(app);
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'static')));; // static폴더 안에 있는 파일들 쓰기 위해
app.use(bodyParser.urlencoded({ extended: false})); // bodyParser 쓰려고 적어주는거

app.use('/', homeRouter);
app.use('/calendar', calendarRouter);
app.use('/profile', profileRouter);
app.use('/notice', noticeRouter);

app.listen(port, () => { console.log(`Server is running on port ${port}`)}); // 3000번 포트로 서버 열어주기
