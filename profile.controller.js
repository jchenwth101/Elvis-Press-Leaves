const db = require("../models");
const Profile = db.profile

exports.getPoints = (req, res) => {
	Profile.findOne({
			where: {
				userId: req.userId
			}
		})
		.then(profile => {
			res.status(200).send({points: profile.points});
		})
		.catch(err => {
			res.status(500).send({message: err.message});
		});
}
