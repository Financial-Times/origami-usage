/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const fs = require('fs');
const path = require('path');

const oFooterHTML = fs.readFileSync(path.join(__dirname, '../fixtures/o-footer.html'), 'utf-8');

const htmlContainsOFooter = require('../../../lib/html-contains-o-footer');

proclaim.isTrue(htmlContainsOFooter(oFooterHTML));

proclaim.isFalse(htmlContainsOFooter('<html><head></head><body></body></html>'));

const oFooterContainsCookies = require('../../../lib/o-footer-contains-cookies');
proclaim.isTrue(oFooterContainsCookies(oFooterHTML));
proclaim.isFalse(oFooterContainsCookies('<html><head></head><body></body></html>'));

const oFooterContainsCopyright = require('../../../lib/o-footer-contains-copyright');
proclaim.isTrue(oFooterContainsCopyright(oFooterHTML));
proclaim.isFalse(oFooterContainsCopyright('<html><head></head><body></body></html>'));

const oFooterContainsPrivacyPolicy = require('../../../lib/o-footer-contains-privacy-policy');
proclaim.isTrue(oFooterContainsPrivacyPolicy(oFooterHTML));
proclaim.isFalse(oFooterContainsPrivacyPolicy('<html><head></head><body></body></html>'));

const oFooterContainsSlavery = require('../../../lib/o-footer-contains-slavery');
proclaim.isTrue(oFooterContainsSlavery(oFooterHTML));
proclaim.isFalse(oFooterContainsSlavery('<html><head></head><body></body></html>'));

const oFooterContainsTermsOfService = require('../../../lib/o-footer-contains-terms-of-service');
proclaim.isTrue(oFooterContainsTermsOfService(oFooterHTML));
proclaim.isFalse(oFooterContainsTermsOfService('<html><head></head><body></body></html>'));

