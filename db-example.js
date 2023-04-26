const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'shareameal',
    port: 3306
})

connection.query(
    'SELECT * FROM `meal`',
    function (err, results, fields) {
        if (err){
            console.log(err.sqlMessage, ' ', err.errno, ' ', err.code);
        }
        console.log(results)
        //console.log(fields)
    }
)

connection.end();

