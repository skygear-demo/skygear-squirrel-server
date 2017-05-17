'use strict';

const skygearCloud = require('skygear/cloud');
const SkygearResponse = skygearCloud.SkygearResponse;
const GitHubRepo = require('./src/GitHubRepo');
process.env.SQUIRREL_DOWNLOADS_PATH = '/downloads';

let serverStatus = 'Initializing....';
try {
	const githubRepo = new GitHubRepo('https://api.github.com/',
		process.env.GITHUB_REPO, 
		process.env.GITHUB_ACCESS_TOKEN
	);
	githubRepo.fetchReleases().then(function() {
        const requestResolver = require('./src/request-resolver');
        const DownloadResolver = require('./src/download-resolver');
        const downloadResolver = new DownloadResolver(githubRepo);
		serverStatus = 'GitHub repo connected!';
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
		});
		skygearCloud.handler(process.env.SQUIRREL_DOWNLOADS_PATH, function(req, options) {
			return downloadResolver.resolve(req.query.platform, req.query.version).then(result => {
				return new SkygearResponse({
					statusCode: 200,
					body: result
				})
			}).catch(e => {
				return new SkygearResponse({
					statusCode: 404,
					body: e.message
                })
			})
		})
	}).catch(function() {
		serverStatus = 'Connection with GitHub repo failed. Check your environment variables(GITHUB_REPO and GITHUB_ACCESS_TOKEN) in Skygear portal.'
	})

} catch (e) {
	serverStatus = 'Environment variables GITHUB_REPO not set';
}

skygearCloud.handler('getStatus', function(req, options) {
	return 'Server Status: ' + serverStatus;
}, {
	method: ['GET', 'POST'],
	userRequired: false
})