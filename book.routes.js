const { authJwt } = require("../middleware");
const controller = require("../controllers/book.controller");

module.exports = function(app) {
	app.use(function(req, res, next) {
		res.header(
			"Access-Control-Allow-Headers",
			"x-access-token, Origin, Content-Type, Accept"
		);
		next();
	});

	app.get("/api/book", [authJwt.verifyToken], controller.getAllBooks); //get all books
	app.get("/api/book/:id", [authJwt.verifyToken], controller.getBook); //get specific
	app.post("/api/book/add", [authJwt.verifyToken], controller.addBook); // add new book
	app.patch("/api/book/:id", [authJwt.verifyToken], controller.editBook); // edit book
	app.delete("/api/book/:id", [authJwt.verifyToken], controller.deleteBook); //delete book
};
