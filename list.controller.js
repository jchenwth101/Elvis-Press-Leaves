const db = require("../models");
const Condition = db.condition

exports.getAllConditions = (req, res) => {
	// Save User to Database
	Condition.findAll()
		.then(conditions => {
			res.status(200).send({
				conditions
			});
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
};
