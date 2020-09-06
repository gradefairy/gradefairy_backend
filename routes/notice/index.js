const express = require('express');
const path = require('path');
const sanitizehtml = require('sanitize-html');
const router = express.Router();
const connection = require('../../dbconnection');

connection.getConnection((err, conn) => {
    if(err) console.error(err.message);
});

// const CATEGORY = {
//     1 : '학사/장학',
//     2 : '기숙사',
//     3 : '컴퓨터소프트웨어학부',
//     4 : '화학공학과',
//     5 : '건축공학부',
// }

router.get('/', (req, res) => {
    res.send("notice page");
});

// user의 filtering에 대한 notice list 반환
router.get('/get', (req, res) => {
    console.log(req.user);
    const id = req.user.id;
    console.log(id);

    connection.query('SELECT filtering FROM `member` WHERE id=?;', [id], (error, rows) => {
        if (error) throw error;
        var filtering = rows[0]['filtering'];

        var q = '';
        for(i = 0; i < filtering.length; i++){
            if(filtering[i] == '1') {
                if(q.length > 0) q += " OR ";
                q += "category=" + i;
            }
        }

        q = "select * from notice where " + q;
        connection.query(q, (error, rows)=> {
            if (error) throw error;
            res.send(rows);
        });
    });
});

// PUT
router.get('/put/:id', (req, res) => {
    // 바뀐 filtering 입력받기
    // var changeFilter = req.body.new_filtering;
    var changeFilter = "0010000000";
    var q = `update member set filtering='${changeFilter}' where id='${req.params.id}'`;

    connection.query(q, (error, rows) => {
        if (error) throw error;
        // console.log(rows);
        
        // update 되었는지 확인하기 위해
        connection.query(`select * from member where id=?`, [req.params.id], (error, rows) => {
            res.send(rows);
        });
    });
});

// get notices
router.get('/reset/notices', async (req, res) => {
    const getData = await require('./crawling.js');
    console.log("done");
    // console.log(getData);
    res.send(getData);
});

module.exports = router;