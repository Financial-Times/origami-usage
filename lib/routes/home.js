'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = app => {

	// Home page
	app.get('/', cacheControl({maxAge: '1d'}), (request, response) => {
		response.render('index', {
			layout: 'main',
			title: 'Origami Usage',
			data: app.origami.results && app.origami.results.data || [],
			completed: app.origami.results && app.origami.results.completed,
			numberOfDomainsToScan: app.origami.results && app.origami.results.numberOfDomainsToScan
		});
	});

};
