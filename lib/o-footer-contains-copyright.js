'use strict';

const cheerio = require('cheerio');

module.exports = function (body) {
	const $ = cheerio.load(body);
	return $.root().has('a[href*="help.ft.com/help/legal-privacy/copyright/copyright-policy"]').length > 0 || $.root().has('a[href*="www.ft.com/servicestools/help/copyright"]').length > 0;
};
