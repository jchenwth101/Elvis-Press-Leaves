var mysql = require('mysql');

var pool = mysql.createPool({
   connectionLimit : 10,
   host            : 'classmysql.engr.oregonstate.edu',
   user            : 'cs361_bordenca', // to be provided
   password        : 'OSU361f@ll2020', // to be provided
   database        : 'cs361_bordenca', // to be provided
   multipleStatements: true
});


module.exports.pool = pool;
