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
		id: 1,
		name: 'osx.zip'
	},
	{
		id: 2,
		name: 'win.exe'
	}
	]
}
];

describe('request-resolver', function() {
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
					url: `${process.env.SQUIRREL_HOST}/${process.env.SQUIRREL_DOWNLOADS_PATH}/osx/1.0.0`
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
						id: 1,
						name: 'osx.dmg'
					},
					{
						id: 2,
						browser_download_url: 'http://url-to-assets/va.b.c/win.exe'
					}
					]
				},
				{
					tag_name: 'v1.0.0',
					prerelease: false,
					assets: [
					{
						id: 1,
						name: 'osx.dmg'
					},
					{
						id: 2,
						name: 'win.exe'
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
					url: `${process.env.SQUIRREL_HOST}/${process.env.SQUIRREL_DOWNLOADS_PATH}/osx/1.0.0`
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
							id: 1,
							name: 'win.exe'
						}
						]
					},
					{
						tag_name: 'v1.0.0',
						prerelease: false,
						assets: [
						{
							id: 2,
							name: 'osx.dmg'
						},
						{
							id: 1,
							name: 'win.exe'
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
						url: `${process.env.SQUIRREL_HOST}/${process.env.SQUIRREL_DOWNLOADS_PATH}/osx/1.0.0`
					}
				})
			}),
			requestResolver.resolve(githubRepo, '0.1.0', 'win').then(result => {
				expect(result).to.deep.equal({
					statusCode: 200,
					body: {
						url: `${process.env.SQUIRREL_HOST}/${process.env.SQUIRREL_DOWNLOADS_PATH}/win/2.0.0`
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
						id: 1,
						name: 'osx.dmg'
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

    it('resolve() skip drafts', () => {
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
                        draft: true,
                        assets: [{
                        	id: 1,
                            name: 'osx.dmg'
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