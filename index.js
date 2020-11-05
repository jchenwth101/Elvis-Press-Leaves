//  Authors:  Andrew Clos & Haley Whoehrle
//  Date:  10/28/2020
//  Title: Elvis Press Leaves - Book Swap
//  Description: This is the server side file for the Book Swap Website

var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var Handlebars = require('handlebars');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var port = 3145;
var bClicked = "";
var updating = "";

//Set port to my default for the quarter (last four of student ID)
//app.set('port', port);
//app.engine('handlebars', handlebars.engine);
//app.set('view engine', 'handlebars');

//app.use(bodyParser.urlencoded({extended: false}));
//app.use(bodyParser.json());
//app.use(express.static('public'));

//Create a helper for an ifConditon
//source: https://stackoverflow.com/questions/38111916/how-to-use-handlebars-conditional-helpers
Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

//Simple fuctions to catch which button was clicked and assign a global variable
app.post('/assignCust', function (req, res) {
    bClicked = "cust";
});
app.post('/assignEmp', function (req, res) {
    bClicked = "emp";
});
app.post('/assignProd', function (req, res) {
    bClicked = "prod";
});
app.post('/assignSale', function (req, res) {
    bClicked = "sal";
});
app.post('/deleteCust', function (req, res) {
    bClicked = "delCust";
});
app.post('/searchCust', function (req, res) {
    bClicked = "searCust";
});
app.post('/updateEmp', function (req, res) {
    bClicked = "upEmp";
});
app.post('/assignSalProd', function (req, res) {
    bClicked = "salProd";
});

//render the home page.
app.get('/', function(req, res, next){
    res.render('index', { title: 'index' ,path:"",});
});

//-- ACCOUNT ~~
// select customers
app.get('/customers', function(req, res, next){
    var context = { title: 'customers' ,path:"customers", };
    var fname = req.query.firstName;
    var lname = req.query.lastName;
    var email = req.query.email;
    var memberSince = req.query.memberSince;
    var sqlQuery = "";
    //build the search logic.  Can search using 0, some or all of the fields.  Blank fields return all results/are ignored.
    if(fname) {
        sqlQuery = `SELECT customerID, email, memberSince, firstName, lastName FROM customers WHERE firstName = '${fname}' ORDER BY customerID DESC`;
        if(lname){
            sqlQuery = `SELECT customerID, email, memberSince, firstName, lastName FROM customers WHERE firstName = '${fname}' AND lastName = '${lname}' ORDER BY customerID DESC`;
        }
    }
    else if (lname) {
        sqlQuery = `SELECT customerID, email, memberSince, firstName, lastName FROM customers WHERE lastName = '${lname}' ORDER BY customerID DESC`;
    }
    else{sqlQuery = `SELECT * FROM customers ORDER BY customerID DESC`;
    }
    if(email) {
        sqlQuery = `SELECT customerID, email, memberSince, firstName, lastName FROM customers WHERE email = '${email}' ORDER BY customerID DESC`;
    }
    if(memberSince) {
    sqlQuery = `SELECT customerID, email, memberSince, firstName, lastName FROM customers WHERE memberSince = '${memberSince}' ORDER BY customerID DESC`;
    }

    mysql.pool.query(sqlQuery, function (err, rows, fields) {
        if(err) {
            next(err);
            return;
        }
        var allCust = [];
        for(var i in rows){
            allCust.push({"id": rows[i].customerID, "email": rows[i].email, "memberSince": rows[i].memberSince, "fName": rows[i].firstName, "lName": rows[i].lastName});
        }
        context.custs = allCust;
        res.render('customers', context);
    });
});

// Delete Customer
app.get('/customerDelete', function(req, res, next) {
    var sqlQuery = `DELETE FROM customers WHERE customerID = '${req.query.id}'`;
    mysql.pool.query(sqlQuery, function (err, rows, fields) {
        if(err) {
            next(err);
            return;
        }
        //res.redirect('/customers');
    });
});

//-- EMPLOYEES ~~
// select employees
app.get('/employees', (req, res, next) => {
    var context = { title: 'employees' ,path:"employees", };
    var fname = req.query.firstName;
    var lname = req.query.lastName;
    var title = req.query.title;
    var sqlQuery = "";
    //build the search logic.  Can search using 0, some or all of the fields.  Blank fields return all results.
    if(fname) {
        sqlQuery = `SELECT * FROM employees WHERE firstName = '${fname}' ORDER BY employeeID DESC`;
        if(lname){
            sqlQuery = `SELECT * FROM employees WHERE firstName = '${fname}' AND lastName = '${lname}' ORDER BY employeeID DESC`;
            if(title){
                sqlQuery = `SELECT * FROM employees WHERE firstName = '${fname}' AND lastName = '${lname}' AND title = '${title}' ORDER BY employeeID DESC`;
            }
        }
        else if(title){
            sqlQuery = `SELECT * FROM employees WHERE firstName = '${fname}' AND title = '${title}' ORDER BY employeeID DESC`;
        }
    }
    else if (lname) {
        sqlQuery = `SELECT * FROM employees WHERE lastName = '${lname}' ORDER BY employeeID DESC`;
        if(title){
            sqlQuery = `SELECT * FROM employees WHERE lastName = '${lname}' AND title = '${title}' ORDER BY employeeID DESC`;
        }
    }
    else if(title){
        sqlQuery = `SELECT * FROM employees WHERE title = '${title}' ORDER BY employeeID DESC`;
    }
    else{sqlQuery = `SELECT * FROM employees ORDER BY employeeID DESC`;}

    mysql.pool.query(sqlQuery, function (err, rows, fields) {
        if(err) {
            next(err);
            return;
        }
        var allEmp = [];
        for(var i in rows){
            allEmp.push({"id": rows[i].employeeID, "sID": rows[i].storeID, "title": rows[i].title, "sTime": rows[i].startTime, "stTime": rows[i].stopTime, "hRate": rows[i].hourlyRate, "pTime": rows[i].partTime, "fName": rows[i].firstName, "lName": rows[i].lastName});
        }
        context.emps = allEmp;
        res.render('employees', context);
    });
});

// Load update page with selected employee information
app.get('/upEmp', function(req, res, next) {

    var sqlQuery = "";
    if(req.query.id || updating){
        if(req.query.id) {
            updating = req.query.id;
        }
        sqlQuery = "SELECT * FROM employees WHERE employeeID = " + updating;
    }
    else {
        sqlQuery = "SELECT * FROM employees";
    }
    mysql.pool.query(sqlQuery, function (err, rows) {
        var context = {};
        if(err) {
            next(err);
            return;
        }
        var upEmp = [];  //we don't have to use a loop here, but in case multiple employee updates are implemented later, we left the loop in.
        for(var i in rows){
            if(i > 0 ) {
                console.log("Warning, Array has more than one element. This is an error, please reload page");
            }
            upEmp.unshift({"id": rows[i].employeeID, "store": rows[i].storeID, "title": rows[i].title, "sTime": rows[i].startTime, "stTime": rows[i].stopTime, "rate": rows[i].hourlyRate, "pTime": rows[i].partTime, "fName": rows[i].firstName, "lName": rows[i].lastName});
        }
        context.emps = upEmp;
        res.render('upEmp', context);
    });
});

// Update the employee info in the database
app.post('/upEmp', (req, res, next) => {
    var sqlQuery = `UPDATE employees SET firstName = '${req.body.firstName}', lastName = '${req.body.lastName}', storeID = '${req.body.storeID}', title = '${req.body.title}', startTime = '${req.body.startTime}', stopTime = '${req.body.endTime}', hourlyRate = '${req.body.hourlyRate}', partTime = '${req.body.partTime}' WHERE employeeID = '${req.body.id}'`;

    if(req.body.id) {
        mysql.pool.query(sqlQuery, function(err, rows, fields) {
            if(err) {
            next(err);
            return;
        }
        res.redirect('/employees');
        });
    }

});

//-- SALES ~~
// select sales
app.get('/sales', (req, res, next) => {
    var context = { title: 'sales' ,path:"sales", };
    var salID = req.query.saleID;
    var custID = req.query.customerID;
    var empID = req.query.employeeID;
    var sqlQuery = "";
    var sqlQuery2 = "";
    //build the search logic.  Can search using 0, some or all of the fields.  Blank fields return all results.
    if(salID) {
        sqlQuery = `SELECT * FROM sales WHERE saleID = '${salID}' ORDER BY saleID DESC`;
        sqlQuery2 = `SELECT * FROM sales_products WHERE sID = '${salID}' ORDER BY sID DESC`;
        if(custID){
            sqlQuery = `SELECT * FROM sales WHERE saleID = '${salID}' AND cID = '${custID}' ORDER BY saleID DESC`;
            sqlQuery2 = `SELECT * FROM sales_products WHERE sID = '${salID}' ORDER BY sID DESC`;
            if(empID){
                sqlQuery = `SELECT * FROM sales WHERE saleID = '${salID}' AND cID = '${custID}' AND eID = '${empID}' ORDER BY saleID DESC`;
                sqlQuery2 = `SELECT * FROM sales_products WHERE sID = '${salID}' ORDER BY sID DESC`;
            }
        }
        else if(empID){
            sqlQuery = `SELECT * FROM sales WHERE saleID = '${salID}' AND eID = '${empID}' ORDER BY saleID DESC`;
            sqlQuery2 = `SELECT * FROM sales_products WHERE sID = '${salID}' ORDER BY sID DESC`;
        }
    }
    else if (custID) {
        sqlQuery = `SELECT * FROM sales WHERE cID = '${custID}' ORDER BY saleID DESC`;
        sqlQuery2 = `SELECT * FROM sales_products JOIN sales ON sales_products.sID = sales.saleID JOIN customers ON sales.cID = customers.customerID WHERE customers.customerID = '${custID}' ORDER BY sID DESC`;
        if(empID){
            sqlQuery = `SELECT * FROM sales WHERE cID = '${custID}' AND eID = '${empID}' ORDER BY saleID DESC`;
            sqlQuery2 = `SELECT * FROM sales_products JOIN sales ON sales_products.sID = sales.saleID JOIN customers ON sales.cID = customers.customerID WHERE customers.customerID = '${custID}' AND sales.eID = '${empID}' ORDER BY sID DESC`;
        }
    }
    else if(empID){
        sqlQuery = `SELECT * FROM sales WHERE eID = '${empID}' ORDER BY saleID DESC`;
        sqlQuery2 = `SELECT * FROM sales_products JOIN sales ON sales_products.sID = sales.saleID WHERE sales.eID = '${empID}' ORDER BY sID DESC`;
    }
    else{
        sqlQuery = `SELECT * FROM sales ORDER BY saleID DESC`;
        sqlQuery2 = `SELECT * FROM sales_products ORDER BY sID DESC`;
    }

    mysql.pool.query(sqlQuery, function (err, rows, fields) {
        if(err) {
            next(err);
            return;
        }
        var allSales = [];
        for(var i in rows){
            allSales.push({"id": rows[i].saleID, "eID": rows[i].eID, "cID": rows[i].cID, "tDate": rows[i].transactionDate, "tPurch": rows[i].totalPurchase});
        }
        mysql.pool.query(sqlQuery2, function (err, rows2, fields) {
            if(err) {
                next(err);
                return;
            }
            var sal_prod = [];
            for(var i2 in rows2){
                sal_prod.push({"sid": rows2[i2].sID, "pid": rows2[i2].pID, "qty": rows2[i2].number});
            }
            context.sal = allSales;
            context.sal_prod = sal_prod;
            res.render('sales', context);
        });
    });
});

//-- PRODUCTS ~~
// select products
app.get('/products', (req, res, next) => {
    var context = { title: 'products' ,path:"products", };
    var prodID = req.query.productId;
    var pName = req.query.name;
    var price = req.query.price;
    var sqlQuery = "";
    var sqlQuery2 = "";
    //build the search logic.  Can search using 0, some or all of the fields.  Blank fields return all results.
    if(prodID) {
        sqlQuery = `SELECT * FROM products WHERE productID = '${prodID}' ORDER BY productID DESC`;
        sqlQuery2 = `SELECT * FROM sales_products WHERE pID = '${prodID}' ORDER BY sID DESC`;
        if(pName){
            sqlQuery = `SELECT * FROM products WHERE productID = '${prodID}' AND name = '${pName}' ORDER BY productID DESC`;
            sqlQuery2 = `SELECT * FROM sales_products JOIN products ON sales_products.pID = products.productID WHERE pID = '${prodID}' AND products.name = '${pName}' ORDER BY sID DESC`;
            if(price){
                sqlQuery = `SELECT * FROM products WHERE productID = '${prodID}' AND name = '${pName}' AND price = '${price}' ORDER BY productID DESC`;
                sqlQuery2 = `SELECT * FROM sales_products WHERE pID = '${prodID}' ORDER BY sID DESC`;
            }
        }
        else if(price){
            sqlQuery = `SELECT * FROM products WHERE productID = '${prodID}' AND price = '${price}' ORDER BY productID DESC`;
            sqlQuery2 = `SELECT * FROM sales_products JOIN products ON sales_products.pID = products.productID WHERE pID = '${prodID}' AND products.price = '${price}' ORDER BY sID DESC`;
        }
    }
    else if (pName) {
        sqlQuery = `SELECT * FROM products WHERE name = '${pName}' ORDER BY productID DESC`;
        sqlQuery2 = `SELECT * FROM sales_products JOIN products ON sales_products.pID = products.productID WHERE products.name = '${pName}' ORDER BY sID DESC`;
        if(price){
            sqlQuery = `SELECT * FROM products WHERE name = '${pName}' AND price = '${price}' ORDER BY productID DESC`;
            sqlQuery2 = `SELECT * FROM sales_products JOIN products ON sales_products.pID = products.productID WHERE products.name = '${pName}' AND products.price = '${price}' ORDER BY sID DESC`;
        }
    }
    else if(price){
        sqlQuery = `SELECT * FROM products WHERE price = '${price}' ORDER BY productID DESC`;
        sqlQuery2 = `SELECT * FROM sales_products JOIN products ON sales_products.pID = products.productID WHERE products.price = '${price}' ORDER BY sID DESC`;
    }
    else{
        sqlQuery = `SELECT * FROM products ORDER BY productID DESC`;
        sqlQuery2 = `SELECT * FROM sales_products ORDER BY sID DESC`;
    }

    mysql.pool.query(sqlQuery, function (err, rows, fields) {
        if(err) {
            next(err);
            return;
        }
        var allProds = [];
        for(var i in rows){
            allProds.push({"id": rows[i].productID, "pName": rows[i].name, "price": rows[i].price});
        }
        mysql.pool.query(sqlQuery2, function (err, rows2, fields) {
            if(err) {
                next(err);
                return;
            }
            var sal_prod = [];
            for(var i2 in rows2){
                sal_prod.push({"sid": rows2[i2].sID, "pid": rows2[i2].pID, "qty": rows2[i2].number});
            }
            context.prod = allProds;
            context.sal_prod = sal_prod;
            res.render('products', context);
        });
    });
});

//MANAGER
//render manager page
app.get('/manager', function(req, res, next){
    var context = { title: 'manager' ,path:"manager", };
    var sqlQuery = `SELECT * FROM customers ORDER BY customerID ASC`;
    var sqlQuery2 = `SELECT * FROM employees ORDER BY employeeID ASC`;

    mysql.pool.query(sqlQuery, function (err, rows, fields) {
        if(err) {
            next(err);
            return;
        }
        var allCust2 = [];
        for(var i in rows){
            allCust2.push({"id": rows[i].customerID, "fName": rows[i].firstName, "lName": rows[i].lastName});
        }
        mysql.pool.query(sqlQuery2, function (err, rows2, fields) {
            if(err) {
                next(err);
                return;
            }
            var allEmp2 = [];
            for(var j in rows2){
            allEmp2.push({"id": rows2[j].employeeID, "fName": rows2[j].firstName, "lName": rows2[j].lastName});
            }
            context.emps = allEmp2;
            context.custs = allCust2;
            res.render('manager', context);
        });
    });
});

// Update the sales_products table number in the database
app.post('/salProd', (req, res, next) => {
    var sqlQuery = `UPDATE sales_products SET n = '${req.body.number}', lastName = '${req.body.lastName}',  WHERE employeeID = '${req.body.id}'`;

    if(req.body.id) {
        mysql.pool.query(sqlQuery, function(err, rows, fields) {
            if(err) {
            next(err);
            return;
        }
        res.redirect('/employees');
        });
    }

});

//INSERT new customer, employee, sale, product, or sales_product
app.post('/manager', (req, res, next) => {

    if(bClicked === "cust"){
        var parametersC = [req.body.email, req.body.memberSince, req.body.custFirstName, req.body.custLastName];
        var queryResultsC = "INSERT INTO customers (email, memberSince, firstName, lastName) VALUES (?,?,?,?)";
        mysql.pool.query(queryResultsC, parametersC, function(err, rows, fields) {
            if(err) {
            next(err);
            return;
        }
        res.redirect('/manager');
        });
    }
    if (bClicked === "emp"){
        var parametersE = [req.body.storeID, req.body.title, req.body.startTime, req.body.stopTime, req.body.hourlyRate,
            req.body.partTime, req.body.empFirstName, req.body.empLastName];
        var queryResultsE = "INSERT INTO employees (storeID, title, startTime, stopTime, hourlyRate, partTime, firstName, lastName) VALUES (?,?,?,?,?,?,?,?)";
        mysql.pool.query(queryResultsE, parametersE, function(err, rows, fields) {
            if(err) {
                next(err);
                return;
            }
            res.redirect('/manager');
            });
    }
    if (bClicked === "sal"){
        var parametersS = [req.body.empID, req.body.custID, req.body.transactionDate, req.body.totalPurchase];
        var queryResultsS = "INSERT INTO sales (eID, cID, transactionDate, totalPurchase) VALUES (?,?,?,?)";
        mysql.pool.query(queryResultsS, parametersS, function(err, rows, fields) {
          if(err) {
            next(err);
            return;
          }
          res.redirect('/manager');
        });
    }
    if (bClicked === "prod") {
        var parametersP = [req.body.pName, req.body.price];
        var queryResultsP = "INSERT INTO products (name, price) VALUES (?,?)";
        mysql.pool.query(queryResultsP, parametersP, function(err, rows, fields) {
          if(err) {
            next(err);
            return;
          }
          res.redirect('/manager');
        });
    }
    if (bClicked === "salProd") {
        var parametersSP = [req.body.sid, req.body.pid, req.body.number];
        var queryResultsSP = "INSERT INTO sales_products (sID, pID, number) VALUES (?,?,?)";
        mysql.pool.query(queryResultsP, parametersP, function(err, rows, fields) {
          if(err) {
            next(err);
            return;
          }
          res.redirect('/manager');
        });
    }
});

//CHANGE LOG
app.get('/changes', (req, res, next) => {
    res.render('changes', { title: 'changes' ,path:"changes",});
});

//boiler plate error and port handling
app.use(function(req, res){
	res.status(404);
	res.render("404");
});

app.use(function(err, req, res, next){
    console.log(err.stack);
    res.type('plain/text');
	res.status(500);
	res.render("500");
});

app.listen(app.get('port'), function(){
    console.log('Express started on port:' + app.get('port') + '; press Ctrl-C to terminate.');
});
