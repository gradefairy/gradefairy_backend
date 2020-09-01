const express = require('express');
const path = require('path');
const sanitizehtml = require('sanitize-html');
const router = express.Router();
const db = require('../../lib/db.js');

// const CATEGORY = {
//     1 : '학사/장학',
//     2 : '기숙사',
//     3 : '컴퓨터소프트웨어학부',
//     4 : '화학공학과',
//     5 : '건축공학부',
// }

router.get('/', (req, res) => {
    res.send("notice pagfe");
});

router.get('/get/:id/', (req, res) => {
    db.query(`select filtering from member where id=?`, [req.params.id], (error, rows) => {
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
        db.query(q, (error, rows)=> {
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

    db.query(q, (error, rows) => {
        if (error) throw error;
        // console.log(rows);
        
        // update 되었는지 확인하기 위해
        db.query(`select * from member where id=?`, [req.params.id], (error, rows) => {
            res.send(rows);
        });
    });
});

module.exports = router;