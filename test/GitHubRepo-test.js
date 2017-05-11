'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var GitHubRepo = require('../src/GithubRepo');
var ServerMock = require("mock-http-server");

describe('github-server', function() {
	var server = new ServerMock({ host: "localhost", port: 9000 });

	beforeEach(function(done) {
		server.start(done);
	});

	afterEach(function(done) {
		server.stop(done);
	});

	function testFetchRelease(repoUrl) {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  200,
				body:    JSON.stringify([
				{
					tag_name: 'v1.0.0',
					prerelease: false,
					assets: []
				}
				])
			}
		});
		var host = 'http://localhost:9000/'
		var accessToken = null;
		var githubRepo = new GitHubRepo(host, repoUrl, accessToken);
		return githubRepo.fetchReleases().then(releases => {
			expect(releases).to.be.an('array');
		})
	}

	it ('fetchRelease()', function() {
		return testFetchRelease('https://github.com/some-user/some-repo')
	})

	it ('fetchRelease() url with /', function() {
		return testFetchRelease('https://github.com/some-user/some-repo/')
	})


	it ('fetchRelease() url without hostname', function() {
		return testFetchRelease('some-user/some-repo')
	})

	it ('fetchRelease() caches response and ETag', function() {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  200,
				headers: {
					ETag: 'some-hash'
				},
				body:    JSON.stringify([
				{
					tag_name: 'v1.0.0',
					prerelease: false,
					assets: []
				}
				])
			}
		});
		var host = 'http://localhost:9000/';
		var repoUrl = 'some-user/some-repo'
		var accessToken = null;
		var githubRepo = new GitHubRepo(host, repoUrl, accessToken);
		return githubRepo.fetchReleases().then(releases => {
			expect(githubRepo._etag).to.equal('some-hash');
			expect(githubRepo._respCache).to.deep.equal([
			{
				tag_name: 'v1.0.0',
				prerelease: false,
				assets: []
			}
			])
		})
	})

	it ('fetchReleases() response with cache if 304 is received', function() {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  304
			}
		});
		var host = 'http://localhost:9000/';
		var repoUrl = 'some-user/some-repo'
		var accessToken = null;
		var githubRepo = new GitHubRepo(host, repoUrl, accessToken);
		githubRepo._respCache = 'cached-data';
		return githubRepo.fetchReleases().then(releases => {
			expect(releases).to.equal('cached-data');
		});
	})

	it('validate() invalid', function() {
		server.on({
			method: 'GET',
			path: '/repos/an-invalid-repo/releases',
			reply: {
				status:  404
			}
		});
		var host = 'http://localhost:9000/';
		var repoUrl = 'an-invalid-repo';
		var accessToken = null;
		var githubRepo = new GitHubRepo(host, repoUrl, accessToken);
		return expect(githubRepo.validate()).to.be.rejected;
	})

	it('validate() valid', function() {
		server.on({
			method: 'GET',
			path: '/repos/a-valid-repo/releases',
			reply: {
				status:  200
			}
		});
		var host = 'http://localhost:9000/';
		var repoUrl = 'a-valid-repo';
		var accessToken = null;
		var githubRepo = new GitHubRepo(host, repoUrl, accessToken);
		return expect(githubRepo.validate()).to.be.fulfilled;
	})

    it('fetchAsset()', () => {
        const assetId = 1;
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases/assets/' + assetId,
            reply: {
                status: 200,
                body: 'asset-data'
            }
        });
        const host = 'http://localhost:9000/';
        const repoUrl = 'some-user/some-repo';
        const accessToken = null;
        const githubRepo = new GitHubRepo(host, repoUrl, accessToken);
        return githubRepo.fetchAsset(assetId).then(resp => {
            expect(resp).to.equal('asset-data');
        });
    });

	it('fetchAssets() with cached data', () => {
        const assetId = 1;
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases/assets/' + assetId,
            reply: {
            	status: req => {
            		return req.headers['if-none-match'] === 'some-hash' ? 304: 200;
				},
				headers: {
            		etag: 'some-hash'
				},
				body: req => {
            		return req.headers['if-none-match'] === 'some-hash' ? 'not this': 'asset-data'
				}

			}
        });
        const host = 'http://localhost:9000/';
        const repoUrl = 'some-user/some-repo';
        const accessToken = null;
        const githubRepo = new GitHubRepo(host, repoUrl, accessToken);
        return githubRepo.fetchAsset(assetId).then(() =>
        	githubRepo.fetchAsset(assetId).then(resp => {
        		expect(resp).to.equal('asset-data');
            })
        );
	})
});