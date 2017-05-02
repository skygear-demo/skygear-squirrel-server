'use strict';
var releaseParser = require('../src/release-parser');
var semver = require('semver');
var acceptedPlatforms = ['osx', 'win']

exports.resolve = function(githubRepo, version, platform) {
	return githubRepo.fetchReleases().then(releases => {
		if (acceptedPlatforms.indexOf(platform) === -1) {
			return {
				statusCode: 404,
				body: `Invalid platform - ${platform}`
			}
		}

		var latestRelease;
		for (var i = 0; i < releases.length; i++) {
			try {
				latestRelease = releaseParser.parse(releases[i]);
				break;
			} catch(e) {
				if (e.message.startsWith('Invalid version number - '))
				continue;
			}
		}

		if (latestRelease !== undefined && semver.gt(latestRelease.version, version)) {
			return {
				statusCode: 200,
				body: {
					url: latestRelease[platform]
				}
			}
		} else {
			return {
				statusCode: 204
			}
		}
	})
}