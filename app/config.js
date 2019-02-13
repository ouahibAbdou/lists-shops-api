import mongoose from 'mongoose';
import chalk from 'chalk'
import figlet from 'figlet'

module.exports = {
	dns: 'http://localhost:2000',
	secret: 'listsshopsnearby.apis.com',
	db: {
		server: 'mongodb://united_remote:united_remote_2019@ds042459.mlab.com:42459/lists-shops-nearby',
		connect: async function Connect(url) {
			return await new Promise((resolved, rejected) => {
				mongoose.connect(url, function (err) {
					if (err) rejected(new Error(`Something wrong, db is not working...`))
					else resolved(true)
				});
			})

		}
	},
	flatit: function (title, theme) {
		console.log(chalk[theme](figlet.textSync(title, { horizontalLayout: 'full' })))
	},
	timeit: function () {
		const now = new Date();
		let year = '' + now.getFullYear();
		let month = '' + (now.getMonth() + 1); if (month.length == 1) { month = '0' + month; }
		let day = '' + now.getDate(); if (day.length == 1) { day = '0' + day; }
		let hour = '' + now.getHours(); if (hour.length == 1) { hour = '0' + hour; }
		let minute = '' + now.getMinutes(); if (minute.length == 1) { minute = '0' + minute; }
		let second = '' + now.getSeconds(); if (second.length == 1) { second = '0' + second; }
		return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + parseFloat(second).toFixed();
		return `${year}-${month}-${day} ${hour}:${minute}:${parseFloat(second).toFixed()}`;
	},
	errors: {
		401: { code: 401, status: false, message: 'Failed to authenticate token.', served_in: Date.now() },
		403: { code: 403, status: false, message: 'No token provided.', served_in: Date.now() },
		400: { code: 400, status: false, message: 'Bad request error.', served_in: Date.now() },
		422: { code: 422, status: false, message: 'Invalid parameters error.', served_in: Date.now() }
	}

};
