const express = require('express');
const router = express.Router();
const connection = require('../../dbconnection');
const ERROR = 404;
const SUCCESS = 200;

connection.getConnection((err, conn) => {
    if(err) console.error(err.message);
});

// const CATEGORY = {
//     0 : '학사/장학',
//     1 : '기숙사',
//     2 : '컴퓨터소프트웨어학부',
//     3 : '화학공학과',
//     4 : '건축공학부',
//     ...
// }

router.get('/', (req, res) => {
    console.log(req.user);
    res.json({
        'code': 200,
        'data': req.user
    })
});

// user의 filtering에 대한 notice list 반환
router.get('/get', (req, res) => {
    const id = req.user.id;
    const sql = 'SELECT filtering FROM `member` WHERE id=?;';

    connection.query(sql, [id], (err, rows) => {
        if(err) {
            console.log(err.message);
            res.json({
                'code': ERROR,
                'message': err.message
            })
        } else {
            var filtering = rows[0]['filtering'];

            var q = '';
            for(i = 0; i < filtering.length; i++){
                if(filtering[i] == '1') {
                    if(q.length > 0) q += " OR ";
                    q += "category=" + i;
                }
            }

            q = "select * from notice where " + q + ";";

            console.log(q);
            connection.query(q, (err, rows)=> {
                if (err) {
                    console.log(err.message);
                    res.json({
                        'code': ERROR,
                        'message': err.message
                    })
                } else {
                    const result = JSON.parse(JSON.stringify(rows));
                    res.json({
                        'code' : SUCCESS,
                        'message': '',
                        'data' : result
                    });
                }
            });
        }
    });
});

// PUT
router.put('/put', (req, res) => {
    const id = req.user.id;
    // TODO : 바뀐 filtering 입력받기
    // var changeFilter = req.body.filtering;
    var changeFilter = "0010000000";

    const sql = 'UPDATE `member` SET filtering=? WHERE id=?;';
    const params = [changeFilter, id];

    connection.query(sql, params, (err, _) => {
        if (err) {
            console.log(err.message);
            res.json({
                'code': ERROR,
                'message': err.message
            })
        }
        // else {
        //     // update 되었는지 확인하기 위해
        //     connection.query('select * from `member` where id=?', [id], (error, rows) => {
        //         res.send(rows);
        //     });
        // }
        
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