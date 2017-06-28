'use strict';

const rp = require('request-promise-native');
const containsOFooter = require('./html-contains-o-footer');
const oFooterContainsCookies = require('./o-footer-contains-cookies');
const oFooterContainsCopyright = require('./o-footer-contains-copyright');
const oFooterContainsPrivacyPolicy = require('./o-footer-contains-privacy-policy');
const oFooterContainsSlavery = require('./o-footer-contains-slavery');
const oFooterContainsTermsOfService = require('./o-footer-contains-terms-of-service');

module.exports = function getDataFromUri(uri) {
	return rp({
		uri: `http://${uri}`,
		followRedirect: false
	})
		.catch(function () {
			return rp({
				uri: `https://${uri}`,
				followRedirect: false
			});
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
				score: oFooterContainsCookies(body) + oFooterContainsCopyright(body) + oFooterContainsPrivacyPolicy(body) + oFooterContainsSlavery(body) + oFooterContainsTermsOfService(body)
			};
		})
		.catch(function () {
			return null;
		});
};
