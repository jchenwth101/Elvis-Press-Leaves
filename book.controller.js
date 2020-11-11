const db = require("../models");
const Book = db.book;
const Condition = db.condition;
const Profile = db.profile;

exports.getAllBooks = (req, res) => {
	// Save User to Database
	Book.findAll({
			include: [
				{ model: db.condition, foreignKey: "conditionId", attributes: ["id", "type"] },
				{ model: db.bookstatus, foreignKey: "bookStatusId", attributes: ["type"] }
			],
			where: {
				userId: req.userId
			}
		})
		.then(books => {
			res.status(200).send({
				books
			});
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
};

exports.getBook = (req, res) => {
	// Save User to Database
	Book.findOne({
			include: [
				{ model: db.condition, foreignKey: "conditionId", attributes: ["id", "type"] },
				{ model: db.bookstatus, foreignKey: "bookStatusId", attributes: ["type"] }
			],
			where: {
				id: req.params.id
			}
		})
		.then(book => {
			res.status(200).send({
				book
			});
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
};

exports.addBook = (req, res) => {
	Book.create({
			title: req.body.title,
			isbn: req.body.isbn,
			quantity: 1,
			conditionId: req.body.condition,
			bookStatusId: 2,
			userId: req.userId
		})
		.then(book => {
			//get the condition value
			Condition.findOne({
				where: {
					id: req.body.condition
				}
			}).then(condition => {
				Profile.findOne({
					where: {
						userId: req.userId,
					}
				}).then(profile => {
					profile.update({
						points: profile.points + condition.value
					}).then(()=>{
						res.status(200).send({ message: "Book added successfully!" });
					});
				});
			});
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
};

exports.editBook = (req, res) => {
	Book.findOne({
		where: {
			id: req.params.id
		}
	}).then(book => {
			book.update({
					title: req.body.title,
					isbn: req.body.isbn,
					conditionId: req.body.condition
				})
				.then(() => {
					res.status(200).send('Book Updated Successfully.');
				});
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
};

exports.deleteBook = (req, res) => {
	// Save User to Database
	Book.findOne({
			where: {
				id: req.params.id
			}
		})
		.then(book => {
			book.destroy()
				.then(() => {
					res.status(200).send('Deleted Successfully.');
				});
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
};
