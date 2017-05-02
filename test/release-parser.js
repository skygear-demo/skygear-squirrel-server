'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var releaseParser = require('../src/release-parser');
function getResFromGitHubApi() {
	return {
		"url": "https://api.github.com/repos/tatgean/skygear-squirrel-endpoint/releases/6246922",
		"assets_url": "https://api.github.com/repos/tatgean/skygear-squirrel-endpoint/releases/6246922/assets",
		"upload_url": "https://uploads.github.com/repos/tatgean/skygear-squirrel-endpoint/releases/6246922/assets{?name,label}",
		"html_url": "https://github.com/tatgean/skygear-squirrel-endpoint/releases/tag/v0.1.0",
		"id": 6246922,
		"tag_name": "v0.1.0",
		"target_commitish": "master",
		"name": "0.1.0",
		"draft": false,
		"author": {
			"login": "tatgean",
			"id": 20782284,
			"avatar_url": "https://avatars0.githubusercontent.com/u/20782284?v=3",
			"gravatar_id": "",
			"url": "https://api.github.com/users/tatgean",
			"html_url": "https://github.com/tatgean",
			"followers_url": "https://api.github.com/users/tatgean/followers",
			"following_url": "https://api.github.com/users/tatgean/following{/other_user}",
			"gists_url": "https://api.github.com/users/tatgean/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/tatgean/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/tatgean/subscriptions",
			"organizations_url": "https://api.github.com/users/tatgean/orgs",
			"repos_url": "https://api.github.com/users/tatgean/repos",
			"events_url": "https://api.github.com/users/tatgean/events{/privacy}",
			"received_events_url": "https://api.github.com/users/tatgean/received_events",
			"type": "User",
			"site_admin": false
		},
		"prerelease": false,
		"created_at": "2017-05-02T04:10:32Z",
		"published_at": "2017-05-02T04:15:57Z",
		"assets": [
		{
			"url": "https://api.github.com/repos/tatgean/skygear-squirrel-endpoint/releases/assets/3780501",
			"id": 3780501,
			"name": "sse-osx.txt",
			"label": null,
			"uploader": {
				"login": "tatgean",
				"id": 20782284,
				"avatar_url": "https://avatars0.githubusercontent.com/u/20782284?v=3",
				"gravatar_id": "",
				"url": "https://api.github.com/users/tatgean",
				"html_url": "https://github.com/tatgean",
				"followers_url": "https://api.github.com/users/tatgean/followers",
				"following_url": "https://api.github.com/users/tatgean/following{/other_user}",
				"gists_url": "https://api.github.com/users/tatgean/gists{/gist_id}",
				"starred_url": "https://api.github.com/users/tatgean/starred{/owner}{/repo}",
				"subscriptions_url": "https://api.github.com/users/tatgean/subscriptions",
				"organizations_url": "https://api.github.com/users/tatgean/orgs",
				"repos_url": "https://api.github.com/users/tatgean/repos",
				"events_url": "https://api.github.com/users/tatgean/events{/privacy}",
				"received_events_url": "https://api.github.com/users/tatgean/received_events",
				"type": "User",
				"site_admin": false
			},
			"content_type": "text/plain",
			"state": "uploaded",
			"size": 3,
			"download_count": 0,
			"created_at": "2017-05-02T04:15:45Z",
			"updated_at": "2017-05-02T04:15:47Z",
			"browser_download_url": "https://github.com/tatgean/skygear-squirrel-endpoint/releases/download/v0.1.0/sse-osx.txt"
		}
		],
		"tarball_url": "https://api.github.com/repos/tatgean/skygear-squirrel-endpoint/tarball/v0.1.0",
		"zipball_url": "https://api.github.com/repos/tatgean/skygear-squirrel-endpoint/zipball/v0.1.0",
		"body": "Dummy release for testing"
	};
}

describe('release-parser', function() {
	it('parse()', function() {
		var result = releaseParser.parse(getResFromGitHubApi());
		expect(result).to.deep.equal({
			version: '0.1.0',
			osx: 'https://github.com/tatgean/skygear-squirrel-endpoint/releases/download/v0.1.0/sse-osx.txt'
		})
	})

	it('parse() version no "v"', function() {
		var data = getResFromGitHubApi();
		data.tag_name = '0.1.0';
		var result = releaseParser.parse(data);
		expect(result).to.deep.equal({
			version: '0.1.0',
			osx: 'https://github.com/tatgean/skygear-squirrel-endpoint/releases/download/v0.1.0/sse-osx.txt'
		})
	})
})