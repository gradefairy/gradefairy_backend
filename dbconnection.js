const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createPool({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    database : process.env.RDS_DATABASE,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT
});

module.exports=connection;