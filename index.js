'use strict';

const skygearCloud = require('skygear/cloud');
const SkygearResponse = skygearCloud.SkygearResponse;
const requestResolver = require('./src/request-resolver');
const GitHubRepo = require('./src/GitHubRepo');
const githubRepo = new GitHubRepo('https://api.github.com/',
	process.env.GITHUB_REPO, 
	process.env.GITHUB_ACCESS_TOKEN
	);
let serverStatus = 'Initializing....'

githubRepo.fetchRelease().then(function() {
	serverStatus = 'GitHub repo connected!'
	skygearCloud.handler('update', function (req, options) {
		return requestResolver.resolve(githubRepo, req.query.version, req.query.platform).then(result => {
			return new SkygearResponse({
				statusCode: result.statusCode,
				body: JSON.stringify(result.body)
			})
		})
	}, {
		method: ['GET', 'POST'],
		userRequired: false
	})
}).catch(function() {
	serverStatus = 'Connection failed. Check your environment variables in Skygear portal please.'
})

skygearCloud.handler('getStatus', function(req, options) {
	return 'Server Status: ' + serverStatus;
}, {
	method: ['GET', 'POST'],
	userRequired: false
})