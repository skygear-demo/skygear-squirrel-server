'use strict'

var rp = require('request-promise');
var url = require('url');

function GitHubRepo(host, repoUrl, accessToken) {
	this.host = host;
	this.repoPath = url.parse(repoUrl).pathname.replace(/^\//, '').replace(/\/$/, '');
	this.accessToken = accessToken;
}

GitHubRepo.prototype.fetchReleases = function() {
	var uri = this.host + 'repos/' + this.repoPath + '/releases';
	console.log(uri);
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