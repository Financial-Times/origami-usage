'use strict';

const cheerio = require('cheerio');

module.exports = function (body) {
	const $ = cheerio.load(body);
	return $.root().has('a[href*="help.ft.com/help/legal-privacy/privacy"]').length > 0 ||
		$.root().has('a[href*="www.ft.com/servicestools/help/privacy"]').length > 0 ||
		$.root().has('a[href*="help.ft.com/tools-services/financial-times-privacy-policy"]').length > 0;
};
