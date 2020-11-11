module.exports = {
	HOST: "localhost",
	USER: "joel",
	PASSWORD: "joel",
	DB: "joel",
	dialect: "mysql",
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	}
};
