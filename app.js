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
    