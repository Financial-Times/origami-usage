'use strict';

const healthChecks = require('./health-checks');
const origamiService = require('@financial-times/origami-service');
const domainData = require('./domain-data');
const requireAll = require('require-all');
const authS3O = require('@financial-times/s3o-middleware');

module.exports = service;

function service(options) {
	const getDomainData = domainData(options);

	getDomainData().then(results => {
		app.origami.results = results;
	});

	// setInterval(function () {
	// 	getDomainData().then(results => {
	// 		app.origami.results = results;
	// 	});
	// }, 24 * 60 * 60 * 1000);

	const health = healthChecks(options);
	options.healthCheck = health.checks();
	options.goodToGoTest = health.gtg();
	options.about = require('../about.json');

	const app = origamiService(options);

	app.use(authS3O);
	mountRoutes(app);
	app.use(origamiService.middleware.notFound());
	app.use(origamiService.middleware.errorHandler());

	return app;
}

function mountRoutes(app) {
	requireAll({
		dirname: `${__dirname}/routes`,
		resolve: initRoute => initRoute(app)
	});
}
