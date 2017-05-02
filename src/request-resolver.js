'use strict';
var releaseParser = require('../src/release-parser');
var semver = require('semver');

exports.resolve = function(githubRepo, version, platform) {
	return githubRepo.fetchReleases().then(releases => {
		var latestRelease = releaseParser.parse(releases[0]);
		if (semver.gt(latestRelease.version, version)) {
			return {
				statusCode: 200,
				body: {
					url: latestRelease[platform]
				}
			}
		}
	})
}