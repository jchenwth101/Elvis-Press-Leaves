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
    const getUserBooks = 'SELECT tbl2.userID, s.username, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition FROM users s INNER JOIN (SELECT u.userID, u.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition FROM user_books u INNER JOIN (SELECT * FROM books b) as tbl1 ON u.bookID = tbl1.id WHERE u.userID = ?) as tbl2 ON s.id = tbl2.userID';
    const getAllUserBooks = 'SELECT tbl2.userID, s.username, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition FROM users s INNER JOIN (SELECT u.userID, u.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition FROM user_books u INNER JOIN (SELECT * FROM books b) as tbl1 ON u.bookID = tbl1.id) as tbl2 ON s.id = tbl2.userID';
    const getShippingAddress = 'SELECT u.firstName, u.lastName, u.street, u.city, u.state, u.zipCode FROM users u WHERE u.id = ?';
    const getPendingSwaps = 'SELECT tbl4.id, tbl4.senderID, tbl4.username, tbl4.receiverID, r.username, tbl4.bookID, tbl4.title, tbl4.author, tbl4.isbn, tbl4.condition, tbl4.pointsTraded, tbl4.swapDate FROM users r INNER JOIN (SELECT p.id, p.senderID, tbl3.username, p.receiverID, tbl3.bookID, tbl3.title, tbl3.author, tbl3.isbn, tbl3.condition, p.pointsTraded, p.swapDate FROM pending_swaps p INNER JOIN (SELECT tbl2.userID, s.username, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition FROM users s INNER JOIN (SELECT u.userID, u.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition FROM user_books u INNER JOIN (SELECT * FROM books b) as tbl1 ON u.bookID = tbl1.id WHERE u.userID = ?) as tbl2 ON s.id = tbl2.userID) as tbl3 ON p.senderID = tbl3.userID) as tbl4 ON r.id = tbl4.receiverID';
    const getCompSwaps = 'SELECT tbl3.senderID, u2.username, tbl3.receiverID, u2.username, tbl3.bookID, tbl3.title, tbl3.author, tbl3.isbn, tbl3.condition, tbl3.pointsTraded, tbl3.swapDate, tbl3.received from users u2 INNER JOIN (SELECT tbl2.senderID, u1.username, tbl2.receiverID, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition, tbl2.pointsTraded, tbl2.swapDate, tbl2.received from users u1 INNER JOIN (SELECT c.senderID, c.receiverID, c.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition, c.pointsTraded, c.swapDate, c.received FROM completed_swaps c INNER JOIN (SELECT * FROM books) as tbl1 ON c.bookID = tbl1.id WHERE c.senderID = ? or c.receiverID = ?) as tbl2 ON u1.id = tbl2.senderID) as tbl3 ON u2.id = tbl3.receiverID';
    const addPending = 'INSERT INTO pending_swaps (`senderID`, `receiverID`, `bookID`, `pointsTraded`, `swapDate`) VALUES (?, ?, ?, ?, ?)';
    const addAccepted = 'INSERT INTO `completed_swaps`(`senderID`, `receiverID`, `bookID`, `pointsTraded`, `swapDate`) VALUES (?,?,?,?,?)';
    const updateReceived = 'UPDATE `completed_swaps` SET `received`= 1 WHERE `senderID` = ? AND `receiverID` = ? AND `bookID` = ? and `swapDate` = ?';
    const delCompSwap = 'DELETE FROM `completed_swaps` WHERE `senderID` = ? AND `receiverID` = ? AND `bookID` = ? and `swapDate` = ?';
    const delPendSwap = 'DELETE FROM `pending_swaps` WHERE senderID = ? AND receiverID = ? AND bookID = ?';
    const delUserBook = 'DELETE FROM `user_books` WHERE `userID`=? AND `bookID`=? AND `points`=?';
    const addAvbPts = 'UPDATE `users` SET `availablePoints`=`availablePoints` + ? WHERE `id`=?';
    const addPndPts = 'UPDATE `users` SET `pendingPoints`=`pendingPoints` + ? WHERE `id`= ?';
    const subAvbPts = 'UPDATE `users` SET `availablePoints`=`availablePoints` - ? WHERE `id`=?';
    const subPndPts = 'UPDATE `users` SET `pendingPoints`=`pendingPoints` - ? WHERE `id`= ?';


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
        console.log(`Express started on http://${process.env.HOSTNAME}:; press Ctrl-C to terminate.`);
    });
    