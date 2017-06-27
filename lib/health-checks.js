'use strict';

const HealthCheck = require('@financial-times/health-check');

module.exports = healthChecks;

function healthChecks(options) {

	// Create and return the health check
	return new HealthCheck({
		checks: [
			{
				type: 'tcp-ip',
				host: 'dynect.net',
				port: 443,
				interval: 10 * 60 * 1000, // 10 minutes
				id: 'dynect-tcp-port-443',
				name: 'Availability of Dyn (TCP/IP connectivity to dynect.net on port 443)',
				severity: 2,
				businessImpact: 'Retrieving the domain list will not be possible. Dashboard will not display any data.',
				technicalSummary: 'Connects to the given host/port and checks that it responds successfully',
				panicGuide: 'Check whether `dynect.net` loads in a web browser and https://www.dynstatus.com// for reported downtime.'
			},
			{
				type: 'cpu',
				threshold: 125,
				interval: 15000,
				id: 'system-load',
				name: 'System CPU usage is below 125%',
				severity: 1,
				businessImpact: 'Application may not be stable',
				technicalSummary: 'Process is hitting the CPU harder than expected',
				panicGuide: 'Restart the service dynos on Heroku'
			}

		],
		log: options.log
	});
}
