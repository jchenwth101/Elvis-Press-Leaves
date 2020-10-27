var mysql = require('mysql');

var pool = mysql.createPool({
   connectionLimit : 10,
   host            : 'classmysql.engr.oregonstate.edu',
   user            : , // to be provided
   password        : , // to be provided
   database        : , // to be provided
   multipleStatements: true
});


module.exports.pool = pool;
