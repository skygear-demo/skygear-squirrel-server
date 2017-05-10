'use strict'

var rp = require('request-promise');
var url = require('url');

function GitHubRepo(host, repoUrl, accessToken) {
	this.host = host;
	this.repoPath = url.parse(repoUrl).pathname.replace(/^\//, '').replace(/\/$/, '');
	this.accessToken = accessToken;
	this.uri = this.host + 'repos/' + this.repoPath + '/releases';
	if (this.accessToken)
		this.uri += "?access_token=" + this.accessToken;
}

GitHubRepo.prototype.fetchReleases = function() {
	var uri = this.uri;
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
			console.log('Serving with new content');
			return resp.body;
		} else if (resp.statusCode === 304) {
			console.log('Serving with cahced content');
			return this._respCache;
		}
	});
}

GitHubRepo.prototype.validate = function() {
	return rp({
		uri:  this.uri,
		headers: {
			'User-Agent': 'skygear-squirrel-endpoint',
			'If-None-Match': this._etag
		},
		resolveWithFullResponse: true,
		json : true
	});
}

GitHubRepo.prototype.fetchReleases

module.exports = GitHubRepo;