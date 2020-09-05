const express = require('express');
const path = require('path');
const sanitizehtml = require('sanitize-html');
const router = express.Router();
// 유저 정보
router.get('/get', (req, res) => {
    res.send("profile get");
});
// 유저 탈퇴
router.delete('/delete', (req, res) => {

});
// 유저 정보 수정
router.put('/put', (req, res) => {

});
// 유저 회원가입
router.post('/post', (req, res) => {

});

module.exports = router;