'use strict';

const cheerio = require('cheerio');

module.exports = function (body) {
	const $ = cheerio.load(body);
	return $.root().has('[data-o-component="o-footer"]').length > 0 && $.root().has('[data-o-component="o-footer"] a[href*="help.ft.com/help/legal-privacy/terms-conditions"]').length > 0;
};
