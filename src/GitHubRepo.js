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
	return rp({
		uri:  uri,
		headers: {
			'User-Agent': 'skygear-squirrel-endpoint'
		},
		resolveWithFullResponse: true,
		json : true
	}).then(resp => {
		this._etag = resp.headers['etag'];
		this._respCache = resp.body;
		return resp.body;
	})
}

module.exports = GitHubRepo;