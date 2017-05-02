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

});