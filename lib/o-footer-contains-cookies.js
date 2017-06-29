'use strict';

const cheerio = require('cheerio');

module.exports = function (body) {
	const $ = cheerio.load(body);
	return $.root().has('a[href*="help.ft.com/help/legal-privacy/cookies"]').length > 0 || $.root().has('a[href*="www.ft.com/cookiepolicy"]').length > 0;
};
