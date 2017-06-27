'use strict';

const fs = require('fs');
const denodeify = require('denodeify');

module.exports = file => denodeify(fs.open)(file, 'r').then(() => true).catch(() => false);
