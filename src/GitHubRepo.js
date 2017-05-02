'use strict'

var rp = require('request-promise');
var url = require('url');

function GitHubRepo(repoUrl, accessToken) {
	console.log(repoUrl)
	this.repoPath = url.parse(repoUrl).pathname.replace(/^\//, '').replace(/\/$/, '');
	console.log(this.repoPath);
	this.accessToken = accessToken;
}

GitHubRepo.prototype.fetchRelease = function(version, platform) {
	var uri ='https://api.github.com/repos/' + this.repoPath + '/releases/tags/v0.1.0';
	return rp({
		uri:  uri,
		headers: {
        'User-Agent': 'skygear-squirrel-endpoint'
    },
    json : true
  }).then(function(result) {
		return result;
	})
}

module.exports = GitHubRepo;