'use strict';

const dynRecords = require('./dyn');
const getDataForDomain = require('./get-data-for-domain');
const dynDataToDomains = require('./dyn-data-to-domains');
const bluebird = require('bluebird');
const uploadToS3 = require('./upload-to-s3');

/**
 * Find all FT sub-domains from Dynect and return useful data about the HTML on their root page.
 * @param {Object} options - The configuration to authenticate with Dynect.
 * @param {String} options.dynCustomerName - The customer name to use when communicating with the Dynect API.
 * @param {String} options.dynUserName - The user name of the Dynect account to use when communicating with the Dynect API.
 * @param {String} options.dynPassword - The password associated with the user name.
 * @param {String} options.cmdbKey - The API key for CMDB access.
 * @throws {TypeError} Will throw if any options are invalid.
 * @returns {Function} Function to call to return a promise of an array of result objects for each domain returned from Dynect.
 */
module.exports = function (options = {}) {
	if (typeof options.dynCustomerName !== 'string') {
		throw new TypeError('The dynCustomerName option must be a string');
	}
	if (typeof options.dynUserName !== 'string') {
		throw new TypeError('The dynUserName option must be a string');
	}
	if (typeof options.dynPassword !== 'string') {
		throw new TypeError('The dynPassword option must be a string');
	}
	if (typeof options.cmdbKey !== 'string') {
		throw new TypeError('The cmdbKey option must be a string');
	}

	return async function () {
		const records = await dynRecords({
			customer_name: options.dynCustomerName,
			user_name: options.dynUserName,
			password: options.dynPassword
		});

		const domains = Array.from(new Set(dynDataToDomains(records)));
		// const domains = ['amp.ft.com', 'polyfill.io', 'cdn.polyfill.io', 'esr-manager.ft.com'];

		const results = {
			completed: false,
			data: [],
			numberOfDomainsToScan: domains.length
		};

		bluebird.resolve(domains)
			.map(domain => {
				return getDataForDomain(options.cmdbKey, domain).then(data => {
					results.numberOfDomainsToScan = results.numberOfDomainsToScan - 1;
					if (data) {
						results.data.push(data);
					}
				});
			}, {
				concurrency: 30
			})
			.then(() => {
				results.completed = true;
				if (options.s3BucketName && options.awsAccessKeyId && options.awsSecretAccessKey && options.awsRegion) {
					return uploadToS3(options, results);
				}
			})
			.then(() => {
				console.log('done');
			})
			.catch(error => {
				console.error(error);
				process.exit(1);
			});

		return results;

	};
};
