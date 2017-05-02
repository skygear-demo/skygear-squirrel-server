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
			'User-Agent': 'skygear-squirrel-endpoint',
			'If-None-Match': this._etag
		},
		resolveWithFullResponse: true,
		simple: false,
		json : true
	}).then(resp => {
		if (resp.statusCode === 200) {
			this._etag = resp.headers['etag'];
			this._respCache = resp.body;
			return resp.body;
		} else if (resp.statusCode === 304) {
			return this._respCache;
		}
	});
}

module.exports = GitHubRepo;