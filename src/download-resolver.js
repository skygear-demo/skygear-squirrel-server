const releaseParaser = require('./release-parser');
const semver = require('semver');

function DownloadResolver(githubRepo) {
    this._githubRepo = githubRepo;
}

DownloadResolver.prototype.resolve = function(platform, version) {
    return this._githubRepo.fetchReleases().then(releases => {
        for (let i = 0; i < releases.length; i++) {
            let r = releaseParaser.parse(releases[i]);
            if (semver.eq(r.version, version) && r[platform]) {
                // r[platform].id
                return this._githubRepo.fetchAsset(r[platform].id)
            }
        }
    });
};

module.exports = DownloadResolver;
