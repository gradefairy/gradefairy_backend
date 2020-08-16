const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const sanitizeHtml = require('sanitize-html');
const router = require('./routes/index');
const port = 3000;

app.use(express.static('static')); // static폴더 안에 있는 파일들 쓰기 위해
app.use(bodyParser.urlencoded({ extended: false})); // bodyParser 쓰려고 적어주는거
app.use(compression()); // compression 써서 파일 압축시켜줄려고 쓰는거

app.use('/', router); // url로 /가 들어오면 라우터로 연결

app.listen(port, () => { console.log(`Server is running on port ${port}`)}); // 3000번 포트로 서버 열어주기