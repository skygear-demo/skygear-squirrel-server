'use strict';

const skygearCloud = require('skygear/cloud');
const SkygearResponse = skygearCloud.SkygearResponse;
const requestResolver = require('./src/request-resolver');
const GitHubRepo = require('./src/GitHubRepo');
const githubRepo = new GitHubRepo('https://api.github.com/',
	process.env.GITHUB_REPO, 
	process.env.GITHUB_ACCESS_TOKEN
);

skygearCloud.handler('update', function (req, options) {
	return requestResolver.resolve(githubRepo, req.query.version, req.query.platform).then(result => {
		return new SkygearResponse({
			statusCode: result.statusCode,
			body: JSON.strigify(result.body)
		})
	})
}, {
	method: ['GET', 'POST'],
	userRequired: false
})

skygearCloud.handler('getInfo', function(req, options) {
	return 'Server running'
}, {
	method: ['GET', 'POST'],
	userRequired: false
})