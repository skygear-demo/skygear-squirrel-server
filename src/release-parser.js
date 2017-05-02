'use strict';

exports.parse = function(data) {
	var result = {};
	result.version = data.tag_name.replace(/^v/, '');
	console.log(data.assets)
	for (var k in data.assets) {
		var a = data.assets[k];
		if (/osx/.test(a.name))	//macos
			result.osx = a.browser_download_url;
	}
	return result;
}