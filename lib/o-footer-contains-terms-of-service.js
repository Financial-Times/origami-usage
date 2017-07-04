'use strict';

const cheerio = require('cheerio');

module.exports = function (body) {
	const $ = cheerio.load(body);
	return $.root().has('a[href*="help.ft.com/help/legal-privacy/terms-conditions"]').length > 0 ||
		$.root().has('a[href*="www.ft.com/servicestools/help/terms"]').length > 0 ||
		$.root().has('a[href*="help.ft.com/tools-services/ft-com-terms-and-conditions"]').length > 0;
};
