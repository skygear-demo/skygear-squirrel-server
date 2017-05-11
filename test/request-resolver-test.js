'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var requestResolver = require('../src/request-resolver');
var GitHubRepo = require('../src/GitHubRepo');
var ServerMock = require("mock-http-server");

var respData = [
{
	tag_name: 'v1.0.0',
	prerelease: false,
	assets: [
	{
		name: 'osx.dmg',
		browser_download_url: 'http://url-to-assets/v1.0.0/osx.dmg',
	},
	{
		name: 'win.exe',
		browser_download_url: 'http://url-to-assets/v1.0.0/win.exe'
	}
	]
}
];

describe.skip('request-resolver', function() {
	// Run an HTTP server on localhost:9000 
	var server = new ServerMock({ host: "localhost", port: 9000 });

	beforeEach(function(done) {
		server.start(done);
	});

	afterEach(function(done) {
		server.stop(done);
	});

	it('resolve()', function() {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  200,
				headers: { "content-type": "application/json" },
				body:    JSON.stringify(respData)
			}
		});
		var githubRepo = new GitHubRepo('http://localhost:9000/', 'some-user/some-repo', null);
		return requestResolver.resolve(githubRepo, '0.1.0', 'osx').then(result => {
			expect(result).to.deep.equal({
				statusCode: 200,
				body: {
					url: 'http://url-to-assets/v1.0.0/osx.dmg'
				}
			})
		})
	})

	it('resolve() 204 for no updates', function() {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  200,
				headers: { "content-type": "application/json" },
				body:    JSON.stringify(respData)
			}
		});
		var githubRepo = new GitHubRepo('http://localhost:9000/', 'some-user/some-repo', null);
		return requestResolver.resolve(githubRepo, '1.0.0', 'osx').then(result => {
			expect(result).to.deep.equal({
				statusCode: 204
			})
		})
	});

	it('resolve() 404 for invalid platform', function() {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  200,
				headers: { "content-type": "application/json" },
				body:    JSON.stringify(respData)
			}
		});
		var githubRepo = new GitHubRepo('http://localhost:9000/', 'some-user/some-repo', null);
		var someInvalidPlatform = 'some-invalid-platform';
		return requestResolver.resolve(githubRepo, '0.1.0', someInvalidPlatform).then(result => {
			expect(result).to.deep.equal({
				statusCode: 404,
				body: `Invalid platform - ${someInvalidPlatform}`
			})
		})
	})

	it('resolve() only newest VALID version is returned', function() {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  200,
				headers: { "content-type": "application/json" },
				body:    JSON.stringify([
				{
					tag_name: 'va.b.c',
					prerelease: false,
					assets: [
					{
						name: 'osx.dmg',
						browser_download_url: 'http://url-to-assets/va.b.c/osx.dmg',
					},
					{
						name: 'win.exe',
						browser_download_url: 'http://url-to-assets/va.b.c/win.exe'
					}
					]
				},
				{
					tag_name: 'v1.0.0',
					prerelease: false,
					assets: [
					{
						name: 'osx.dmg',
						browser_download_url: 'http://url-to-assets/v1.0.0/osx.dmg',
					},
					{
						name: 'win.exe',
						browser_download_url: 'http://url-to-assets/v1.0.0/win.exe'
					}
					]
				},
				])
			}
		});
		var githubRepo = new GitHubRepo('http://localhost:9000/', 'some-user/some-repo', null);
		return requestResolver.resolve(githubRepo, '0.1.0', 'osx').then(result => {
			expect(result).to.deep.equal({
				statusCode: 200,
				body: {
					url: 'http://url-to-assets/v1.0.0/osx.dmg'
				}
			})
		})
	})

	it('resolve() use old version if no assets available for a platform', function() {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  200,
				headers: { "content-type": "application/json" },
				body:    JSON.stringify([
				{
					tag_name: 'v2.0.0',
					prerelease: false,
					assets: [
						//no assets for osx platform
						{
							name: 'win.exe',
							browser_download_url: 'http://url-to-assets/v2.0.0/win.exe'
						}
						]
					},
					{
						tag_name: 'v1.0.0',
						prerelease: false,
						assets: [
						{
							name: 'osx.dmg',
							browser_download_url: 'http://url-to-assets/v1.0.0/osx.dmg',
						},
						{
							name: 'win.exe',
							browser_download_url: 'http://url-to-assets/v1.0.0/win.exe'
						}
						]
					},
					])
			}
		});
		var githubRepo = new GitHubRepo('http://localhost:9000/', 'some-user/some-repo', null);
		return Promise.all([
			requestResolver.resolve(githubRepo, '0.1.0', 'osx').then(result => {
				expect(result).to.deep.equal({
					statusCode: 200,
					body: {
						url: 'http://url-to-assets/v1.0.0/osx.dmg'
					}
				})
			}),
			requestResolver.resolve(githubRepo, '0.1.0', 'win').then(result => {
				expect(result).to.deep.equal({
					statusCode: 200,
					body: {
						url: 'http://url-to-assets/v2.0.0/win.exe'
					}
				})
			})
			])
	})

	it('resolve() responses with 204 if no assets at all', function() {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  200,
				headers: { "content-type": "application/json" },
				body:    JSON.stringify([
				{
					tag_name: 'v1.0.0',
					prerelease: false,
					assets: []
				}
				])
			}
		});
		var githubRepo = new GitHubRepo('http://localhost:9000/', 'some-user/some-repo', null);
		return requestResolver.resolve(githubRepo, '0.1.0', 'osx').then(result => {
			expect(result).to.deep.equal({
				statusCode: 204
			})
		})
	})

	it('resolve() preleases should not be served', () => {
		server.on({
			method: 'GET',
			path: '/repos/some-user/some-repo/releases',
			reply: {
				status:  200,
				headers: { "content-type": "application/json" },
				body:    JSON.stringify([
				{
					tag_name: 'v1.0.0',
					prerelease: true,
					assets: [{
						name: 'osx.dmg',
						browser_download_url: 'http://url-to-assets/v1.0.0/osx.dmg',
					}]
				}
				])
			}
		});
		var githubRepo = new GitHubRepo('http://localhost:9000/', 'some-user/some-repo', null);
		return requestResolver.resolve(githubRepo, '0.1.0', 'osx').then(result => {
			expect(result).to.deep.equal({
				statusCode: 204
			})
		})
	})
})