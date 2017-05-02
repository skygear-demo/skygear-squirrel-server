'use strict';

var semver = require('semver');
var path = require('path');

var osxExtPriority = ['.zip', '.dmg'];

exports.parse = function(data) {
	var result = {};
	if (semver.valid(data.tag_name) === null)
		throw new Error(`Invalid version number - ${data.tag_name}. Your version number must follow SemVer.`);
	result.version = semver.clean(data.tag_name);
	for (var k in data.assets) {
		var a = data.assets[k];
		var newExt = path.extname(a.name);
		var oldOsxExt = result.osx ? path.extname(result.osx) : null;
		if (/osx/.test(a.name) && osxExtPriority.indexOf(newExt) >= osxExtPriority.indexOf(oldOsxExt))	//macos
			result.osx = a.browser_download_url;
		if (result.win === undefined && /win/.test(a.name)) //win
			result.win = a.browser_download_url;
	}
	return result;
}