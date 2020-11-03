var express     = require("express"),
    app         = express(),
    handlebars  = require("express-handlebars").create({defaultLayout: "main"}),
    bodyParser  = require("body-parser"),
    mysql       = require('./dbcon.js'),
//    port        = process.env.port || 9229;  // port for OSU flip
    port        = process.env.port || 3003;   // port for local

    app.use(express.static('public'));
    app.engine("handlebars", handlebars.engine);
    app.set("view engine", "handlebars");
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    
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
        //var context = {}
        //context.message = 'setup successful';
        res.render('home');
    });  

    // USER'S ACCOUNT ROUTE
    app.get("/:userID/account", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;
    
        res.render('useraccount', contents);
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
    