const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

router.get('/', (req, res) => {
    res.send('calendar page');
});


module.exports = router;