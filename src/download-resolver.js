'use strict';

const releaseParaser = require('./release-parser');
const semver = require('semver');
const acceptedPlatforms = ['osx', 'win'];
function DownloadResolver(githubRepo) {
    this._githubRepo = githubRepo;
}

DownloadResolver.prototype.resolve = function(platform, version) {
    return this._githubRepo.fetchReleases().then(releases => {
        if (acceptedPlatforms.indexOf(platform) === -1)
            throw new Error('Invalid platform - ' + platform);
        for (let i = 0; i < releases.length; i++) {
            let r = releaseParaser.parse(releases[i]);
            if (semver.eq(r.version, version) && r[platform]) {
                // r[platform].id
                return this._githubRepo.fetchAsset(r[platform].id)
            }
        }
        throw new Error('Asset not found');
    });
};

module.exports = DownloadResolver;
