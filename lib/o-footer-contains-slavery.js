'use strict';

const cheerio = require('cheerio');

module.exports = function (body) {
	const $ = cheerio.load(body);
	return $.root().has('a[href*="help.ft.com/help/legal/slavery-statement"]').length > 0;
};
