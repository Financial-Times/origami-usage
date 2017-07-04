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
	cmdbKey: process.env.CMDB_KEY,
	s3BucketName: process.env.AWS_BUCKET_NAME,
	awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
	awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	awsRegion: process.env.AWS_REGION
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
