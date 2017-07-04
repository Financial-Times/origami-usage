'use strict';

module.exports = app => {

	// Home page
	app.get('/', (request, response) => {
		response.render('index', {
			layout: 'main',
			title: 'Origami Usage',
			data: app.origami.results && app.origami.results.data || [],
			completed: app.origami.results && app.origami.results.completed,
			numberOfDomainsToScan: app.origami.results && app.origami.results.numberOfDomainsToScan,
			numberOfRealSites: app.origami.results && (app.origami.results.data || []).filter(d => d.realPage === 'Yes').length,
			numberOfDomains: app.origami.results && (app.origami.results.data || []).length
		});
	});

};
