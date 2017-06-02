'use strict';

var semver = require('semver');
var path = require('path');

var osxExtPriority = ['.zip', '.dmg'];
var winExtPriority = ['.zip', '.nupkg', '.exe'];

exports.parse = function(data) {
	var result = {};
	if (semver.valid(data.tag_name) === null)
		throw new Error(`Invalid version number - ${data.tag_name}. Your version number must follow SemVer.`);
	result.version = semver.clean(data.tag_name);
	result.prerelease = data.prerelease;
	for (var k in data.assets) {
		var a = data.assets[k];
		var newExt = path.extname(a.name);
		var oldOsxExt = result.osx ? path.extname(result.osx) : null;
		var oldWinExt = result.win ? path.extname(result.win) : null;
		if (/osx/.test(a.name) && osxExtPriority.indexOf(newExt) >= osxExtPriority.indexOf(oldOsxExt))	//macos
			result.osx = a.browser_download_url;
		if (/win/.test(a.name) && winExtPriority.indexOf(newExt) >= winExtPriority.indexOf(oldWinExt)) //win
			result.win = a.browser_download_url;
	}
	return result;
};