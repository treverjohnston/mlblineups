let defaultErrorHandler = (err, req, res, next) => {
	let error;
	console.log('Error Caught:')
	console.log(err);
	if (res.headersSent) {
		return next(err);
	}
	let env = process.env.NODE_ENV;
	if (env !== 'production') {
		error = {
			ok: false,
			error: err.message,
			stack: err
		}
	} else {
		error = {
			ok: false,
			error: err.message,
		}
	}
	res.status(400).send(error);
}

//Default Urls 
var whitelist = ['http://localhost:8080', 'http://192.168.0.13:8080', 'https://inspireq.herokuapp.com'];//add heroku website later
// var whitelist = ['*'];//add heroku website later
var corsOptions = {
	origin: function (origin, callback) {
		var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
		callback(null, originIsWhitelisted);
	},
	credentials: true
};



module.exports = {
	defaultErrorHandler,
	corsOptions
}