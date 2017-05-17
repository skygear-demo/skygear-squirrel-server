'use strict'

var rp = require('request-promise');
var url = require('url');

function GitHubRepo(host, repoUrl, accessToken) {
    this.host = host;
    this.repoPath = url.parse(repoUrl).pathname.replace(/^\//, '').replace(/\/$/, '');
    this.accessToken = accessToken;
    this.uri = this.host + 'repos/' + this.repoPath + '/releases';
    //if (this.accessToken)
    //	this.uri += "?access_token=" + this.accessToken;
    this._cachedAssets = {};
}

GitHubRepo.prototype.fetchReleases = function () {
    var uri = this.uri;
    let qs = this.accessToken ? {access_token: this.accessToken} : {};
    return rp({
        uri: uri,
        headers: {
            'User-Agent': 'skygear-squirrel-endpoint',
            'If-None-Match': this._etag
        },
        qs: qs,
        resolveWithFullResponse: true,
        simple: false,
        json: true
    }).then(resp => {
        if (resp.statusCode === 200) {
            this._etag = resp.headers['etag'];
            this._respCache = resp.body;
            console.log('Serving with new content');
            return resp.body;
        } else if (resp.statusCode === 304) {
            console.log('Serving with cahced content');
            return this._respCache;
        } else {
            throw new Error('Connection failed.');
        }
    });
}

GitHubRepo.prototype.validate = function () {
    return rp({
        uri: this.uri,
        headers: {
            'User-Agent': 'skygear-squirrel-endpoint',
            'If-None-Match': this._etag
        },
        resolveWithFullResponse: true,
        json: true
    });
}

GitHubRepo.prototype.fetchAsset = function (id) {
    console.log(this.uri + '/assets/' + id);
    console.log(this.accessToken);
    let cache = this._cachedAssets[id];
    let headers = {
        'User-Agent': 'skygear-squirrel-endpoint',
        'Accept': 'application/octet-stream',
    };
    if (cache)
        headers['if-none-match'] = cache.etag;
    return rp({
        uri: this.uri + '/assets/' + id,
        qs: {
            access_token: this.accessToken
        },
        headers : headers,
        resolveWithFullResponse: true,
        simple: false,
    }).then(resp => {
        console.log('!!!!!!!!!!!!b2')
        if (resp.statusCode === 200) {
            this._cachedAssets[id] = {
                etag: resp.headers.etag,
                data: resp.body
            };
            return resp.body;
        }
        if (resp.statusCode === 304) {
            return cache.data;
        }
    })
};

module.exports = GitHubRepo;