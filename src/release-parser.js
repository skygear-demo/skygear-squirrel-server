'use strict';

var semver = require('semver');

exports.parse = function(data) {
	var result = {};
	if (semver.valid(data.tag_name) === null)
		throw new Error(`Invalid version number - ${data.tag_name}. Your version number must follow SemVer.`);
	result.version = semver.clean(data.tag_name);
	for (var k in data.assets) {
		var a = data.assets[k];
		if (/osx/.test(a.name))	//macos
			result.osx = a.browser_download_url;
	}
	return result;
}