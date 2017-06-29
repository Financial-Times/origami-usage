'use strict';

const rp = require('request-promise-native');
const containsOFooter = require('./html-contains-o-footer');
const oFooterContainsCookies = require('./o-footer-contains-cookies');
const oFooterContainsCopyright = require('./o-footer-contains-copyright');
const oFooterContainsPrivacyPolicy = require('./o-footer-contains-privacy-policy');
const oFooterContainsSlavery = require('./o-footer-contains-slavery');
const oFooterContainsTermsOfService = require('./o-footer-contains-terms-of-service');

module.exports = function getDataFromUri(cmdbKey, uri) {
	return rp({
			uri: `http://${uri}`,
			followRedirect: false
	})
		.catch(function (error) {
			if (error.statusCode > 299 && error.statusCode < 400 && error.response.headers.location.startsWith(`http://${uri}`)) {
				return rp({
					uri: error.response.headers.location,
					followRedirect: false
				});
			}
		})
		.catch(function () {
			return rp({
				uri: `https://${uri}`,
				followRedirect: false
			});
		})
		.catch(function (error) {
			if (error.statusCode > 299 && error.statusCode < 400 && error.response.headers.location.startsWith(`https://${uri}`)) {
				return rp({
					uri: error.response.headers.location,
					followRedirect: false
				});
			}
		})
		.then(function (body) {
			return {
				domain: uri,
				containsOFooter: containsOFooter(body) ? 'Yes' : 'No',
				bodyLength: body.length,
				oFooterContainsCookies: oFooterContainsCookies(body) ? 'Yes' : 'No',
				oFooterContainsCopyright: oFooterContainsCopyright(body) ? 'Yes' : 'No',
				oFooterContainsPrivacyPolicy: oFooterContainsPrivacyPolicy(body) ? 'Yes' : 'No',
				oFooterContainsSlavery: oFooterContainsSlavery(body) ? 'Yes' : 'No',
				oFooterContainsTermsOfService: oFooterContainsTermsOfService(body) ? 'Yes' : 'No',
				realPage: body.length > 1000 ? 'Yes' : 'No',
				score: oFooterContainsCookies(body) + oFooterContainsCopyright(body) + oFooterContainsPrivacyPolicy(body) + oFooterContainsSlavery(body) + oFooterContainsTermsOfService(body),
				dateScanned: Date.now()
			};
		})
		.then(function (data) {
			return rp.get(
					`https://cmdb.in.ft.com/v3/items/endpoint?base=${uri}`, {
						headers: {
							'x-api-key': cmdbKey,
							'Content-Type': 'application/json'
						}
					}
				)
				.then(function (cmdbData) {
					const isInCMDB = true;
					let systemCode;
					let deweyURL;

					try {
						systemCode = cmdbData[0]['isHealthcheckFor']['system'][0]['dataItemID'];
						deweyURL = `https://dewey.ft.com/${systemCode}.html`;
					} catch (e) {

					}

					let productOwnerName;

					try {
						productOwnerName = cmdbData[0]['isHealthcheckFor']['system'][0]['productOwnerName'];
					} catch (e) {

					}

					return Object.assign({},
						data, {
							isInCMDB,
							systemCode,
							deweyURL,
							productOwnerName
						});
				})
				.catch(function () {
					const isInCMDB = false;
					return Object.assign({},
						data, {
							isInCMDB
						});
				});
		})
		.catch(function (error) {
			if (error.statusCode === 302 && error.response.headers.location.startsWith('https://s3o.ft.com/v2/authenticate?')) {
				return {
					domain: uri,
					behindS3O: 'Yes',
					dateScanned: Date.now(),
					realPage: 'Yes'
				};
			}
			return null;
		});
};