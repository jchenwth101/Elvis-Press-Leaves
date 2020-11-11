const db = require("../models");
const User = db.user

exports.getUser = (req, res) => {
	// Save User to Database
	User.findOne({
			where: {
				id: req.userId
			},
			include: [
				{ model: db.profile, foreignKey: "userId", attributes: ["points"] },
			],
		})
		.then(user => {
			res.status(200).send({
				user
			});
		})
		.catch(err => {
			res.status(500).send({message: err.message});
		});
};
