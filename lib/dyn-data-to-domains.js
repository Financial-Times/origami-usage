'use strict';

// Remove record ID suffix and api path prefix
module.exports = data => data.map(record => record.replace(/^\/REST\/(ARecord|AAAARecord|CNAMERecord)\/ft\.com\//, '').replace(/\/[0-9]+/, ''));
