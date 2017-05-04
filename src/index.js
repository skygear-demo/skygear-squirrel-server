'use strict';

const skygearCloud = require('skygear/cloud');
const SkygearResponse = require('skygear/lib/cloud/transport/common.js').SkygearResponse;
const requestResolver = require('./request-resolver');
const GitHubRepo = require('./GitHubRepo');
const githubRepo = new GitHubRepo('https://api.github.com/',
	process.env.GITHUB_REPO, 
	process.env.GITHUB_ACCESS_TOKEN
);

skygearCloud.handler('update', function (req, options) {
	return requestResolver.resolve(githubRepo, req.query.version, req.query.platform).then(result => {
		return new SkygearResponse({
			statusCode: result.statusCode,
			body: result.body
		})
	})
}, {
	method: ['GET', 'POST'],
	userRequired: false
})