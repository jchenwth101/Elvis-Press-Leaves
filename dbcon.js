var mysql = require('mysql');

var pool = mysql.createPool({
   connectionLimit : 10,
   connectTimeout  : 1000000,
   host            : 'classmysql.engr.oregonstate.edu',
   user            : 'cs361_bordenca',
   password        : 'OSU361f@ll2020',
   database        : 'cs361_bordenca',
   multipleStatements: true
});


module.exports.pool = pool;
