const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log(req.user);
    res.json({
        'code': 200,
        'data': req.user
    })
});

module.exports = router;