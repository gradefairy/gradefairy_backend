const express = require('express');
const path = require('path');
const sanitizehtml = require('sanitize-html');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("notice pagfe");
});

module.exports = router;