var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;


describe('github-server', function() {
	function testFetchRelease(repoUrl) {
		var GitHubRepo = require('../src/GithubRepo');
		var accessToken = null;
		var githubRepo = new GitHubRepo(repoUrl, accessToken);
		return githubRepo.fetchReleases().then(releases => {
			expect(releases).to.be.an('array');
		})
	}

	it ('fetchRelease()', function() {
		return testFetchRelease('https://github.com/tatgean/skygear-squirrel-endpoint')
	})

	it ('fetchRelease() url with /', function() {
		return testFetchRelease('https://github.com/tatgean/skygear-squirrel-endpoint/')
	})


	it ('fetchRelease() url without hostname', function() {
		return testFetchRelease('tatgean/skygear-squirrel-endpoint')
	})

});