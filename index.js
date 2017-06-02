'use strict';

const skygearCloud = require('skygear/cloud');
const SkygearResponse = skygearCloud.SkygearResponse;
const requestResolver = require('./src/request-resolver');
const GitHubRepo = require('./src/GitHubRepo');

let serverStatus = 'Initializing....';
try {
	const githubRepo = new GitHubRepo('https://api.github.com/',
		process.env.GITHUB_REPO, 
		null
	);
	githubRepo.fetchReleases().then(function() {
		serverStatus = 'GitHub repo connected!';
		skygearCloud.handler('update', function (req) {
			return requestResolver.resolve(githubRepo, req.query.version, req.query.platform).then(result => {
				return new SkygearResponse({
					statusCode: result.statusCode,
					body: JSON.stringify(result.body)
				});
			});
		}, {
			method: ['GET', 'POST'],
			userRequired: false
		});
	}).catch(function() {
		serverStatus = 'Connection with GitHub repo failed. Please make sure environment variable - GITHUB_REPO - is a valid GitHub repo.';
	});

} catch (e) {
	serverStatus = 'Environment variables GITHUB_REPO not set';
}

skygearCloud.handler('getStatus', function() {
	return 'Server Status: ' + serverStatus;
}, {
	method: ['GET', 'POST'],
	userRequired: false
});