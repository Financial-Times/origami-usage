'use strict';

const request = require('request-promise-native');

module.exports = function ({
	customer_name,
	user_name,
	password
}) {
	return request.post(
			'https://api.dynect.net/REST/Session/', {
				json: {
					customer_name,
					user_name,
					password
				}
			}
		)
		.then(body => {
			if (body.status === 'success') {
				return body.data.token;
			} else {
				return null;
			}
		})
		.then(token => {
			if (token) {
				return request.get(
						'https://api.dynect.net/REST/AllRecord/ft.com', {
							headers: {
								'Auth-Token': token,
								'Content-Type': 'application/json'
							},
							followRedirect: false
						}
					)
					.catch(function retryIfRedirected(error) {
						return new Promise((resolve, reject) => {

							if (error.statusCode === 307) {
								setTimeout(function () {
									let jobPath = '';

									try {
										jobPath = `/REST/Job/${JSON.parse(error.error).job_id}`;
									} catch (err) {
										jobPath = error.error;
									}

									return request.get(
											`https://api.dynect.net${jobPath}`, {
												headers: {
													'Auth-Token': token,
													'Content-Type': 'application/json'
												},
												followRedirect: false
											})
										.then(resolve, retryIfRedirected)
										.then(resolve);
								}, 10 * 1000);

							} else {
								return reject(error);
							}
						});
					});
			} else {
				return null;
			}
		})
		.then(body => {
			if (body) {
				return JSON.parse(body).data;
			} else {
				return [];
			}
		})
		.catch((err) => {
			console.log('err', err);
			return [];
		});
};
