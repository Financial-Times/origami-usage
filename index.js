'use strict';

const dotenv = require('dotenv');
const service = require('./lib/service');
const throng = require('throng');

dotenv.load({
	silent: true
});

const options = {
	defaultLayout: 'main',
	dynCustomerName: process.env.DYN_CUSTOMER_NAME,
	dynUserName: process.env.DYN_USER_NAME,
	dynPassword: process.env.DYN_PASSWORD,
	log: console,
	name: 'Origami Usage',
	workers: process.env.WEB_CONCURRENCY || 1,
	cmdbKey: process.env.CMDB_KEY
};

function startWorker(id) {
	console.log(`Started worker ${id}`);
	service(options).listen().catch(() => {
		process.exit(1);
	});
}

throng({
	workers: options.workers,
	start: startWorker
});
