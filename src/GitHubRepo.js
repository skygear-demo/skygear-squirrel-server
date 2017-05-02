'use strict'

var rp = require('request-promise');
var url = require('url');

function GitHubRepo(repoUrl, accessToken) {
	this.repoPath = url.parse(repoUrl).pathname.replace(/^\//, '').replace(/\/$/, '');
	this.accessToken = accessToken;
}

GitHubRepo.prototype.fetchReleases = function() {
	var uri ='https://api.github.com/repos/' + this.repoPath + '/releases';
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