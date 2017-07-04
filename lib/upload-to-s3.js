'use strict';

const AWS = require('aws-sdk');

module.exports = function (options, domainData) {
AWS.config.region = options.awsRegion;

	const S3 = new AWS.S3({
		accessKeyId: options.awsAccessKeyId,
		secretAccessKey: options.awsSecretAccessKey,
		params: {
			Bucket: options.s3BucketName
		}
	});

	const s3Params = {
		Key: new Date().toDateString().replace(/\s/g,'-'),
		Body: JSON.stringify(domainData, null, 4),
		ContentType: 'application/json'
	};

	return S3.putObject(s3Params).promise();
};
