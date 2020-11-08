
//https://www.npmjs.com/package/bcrypt

var session     = require("express-session"),
    express     = require("express"),
    app         = express(),
    handlebars  = require("express-handlebars").create({defaultLayout: "main"}),
    bodyParser  = require("body-parser"),
    mysql       = require('mysql'),
//    port        = process.env.port || 9229;  // port for OSU flip
    port        = process.env.port || 3003;   // port for local

    var connection = mysql.createConnection({
      connectionLimit : 10,
      host            : 'classmysql.engr.oregonstate.edu',
      user            : 'cs361_bordenca',
      password        : 'OSU361f@ll2020',
      database        : 'cs361_bordenca',
    });

    app.use(express.static('public'));
    app.engine("handlebars", handlebars.engine);
    app.set("view engine", "handlebars");
    app.use(session({secret: 'secret', resave: true, saveUninitialized: true}))
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(express.static('images'));
    // SQL Queries for calling in various app.post routes
    const newUser = 'INSERT INTO users (`username`, `email`, `password`, `firstName`, `lastName`, `street`, `city`, `state`, `zipCode`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const loginID = 'SELECT id FROM users WHERE username=? and password=?';
    const newBook = 'INSERT INTO books (`title`, `author`, `isbn`, `condition`) VALUES (?, ?, ?, ?)';
    const addBookToUser = 'INSERT INTO user_books (`userID`, `bookID`, `points`) VALUES (?, ?, ?)';
    const getUserBooks = 'SELECT u.userID, u.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition FROM user_books u INNER JOIN (SELECT * FROM books b) as tbl1 ON u.bookID = tbl1.id WHERE u.userID = ?';
    const getShippingAddress = 'SELECT u.firstName, u.lastName, u.street, u.city, u.state, u.zipCode FROM users u WHERE u.id = ?';
// To be added    const getPendingSwaps;

    // ROOT ROUTE
    app.get("/", function(req, res, next){

        res.render('home',{style:"home.css"});
    });

    // USER'S ACCOUNT ROUTE
    app.get("/welcomePage", function(req, res, next) {

        res.render('welcomePage', {style: "welcomePage.css"});
    });
    app.get("/welcomePage_error", function(req, res, next) {

        res.render('welcomePage_error', {style: "welcomePage.css"});
    });

  app.post('/authentication', function(request, response)
  {
    const bcrypt = require('bcrypt');
	   var username = request.body.username;
	    var password = request.body.password;
	     if (username && password)
       {

		       connection.query('SELECT password FROM users WHERE username = ?', [username], function(error, row, fields)
           {


            bcrypt.compare(password, row[0].password, function(err, res) {

              if(res)
                response.render('home');
              else {
                 response.render('welcomePage_error',{style: "welcomePage.css"});
                }
            });

		        });
	     }

});


app.get("/signUp", function(req, res, next) {

    res.render('signUp', {style: "signUp.css"});
});

app.post("/storeAccountInfo", function(req, res, next) {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  const username = req.body.username;
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const zipCode = req.body.zipCode;
  const password = req.body.password;


  bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {

              if (username && password && email && firstName && lastName && street && city && state && zipCode)
              {
                  //connection.query('INSERT INTO accounts (password,username) VALUES (?,?)', [hash,username], function(error, results, fields){});
                connection.query('INSERT INTO users (username,email,password,firstName,lastName,street,city,state,zipCode) VALUES (?,?,?,?,?,?,?,?,?)', [username,email,hash,firstName,lastName,street,city,state,zipCode], function(error, results, fields){
                  if (error)
                  {
                    throw error;
                  }else{
                    console.log("1 record inserted");
                    res.render('welcomePage', {style: "welcomePage.css"});
                  }
                });

              }
          });
      });


});

app.get('/home', function(req, res) {
	if (req.session.loggedin) {
		res.send('Welcome back, ' + req.session.username + '!!!!');
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
});
    // USER'S PERSONAL BOOKSHELF ROUTE
    app.get("/:userID/shelf", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;

        res.render('usershelf', contents);
    });

    // PUBLIC VIEW OF A USER'S SHELF
    app.get("/:userID/viewshelf", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;

        res.render('viewshelf', contents);
    });

    // 404 ROUTE
    app.use(function(req, res){
        res.status(404);
        res.render('404');
    });

    // 500 ROUTE
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.status(500);
        res.render('500');
    });

    app.listen(port, function(){
        console.log(`Express started on http://${process.env.HOSTNAME}; press Ctrl-C to terminate.`);
    });
