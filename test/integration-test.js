'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const GitHubRepo = require('../src/GitHubRepo');
const requestResolver = require('../src/request-resolver');
const DownloadResolver = require('../src/download-resolver.js');

process.env.SQUIRREL_HOST = "some-host";
process.env.SQUIRREL_DOWNLOADS_PATH = "download";

describe.skip('Integration test', () => {
	it('/:platform/:currentVersion', () => {
		const gitHubRepo = new GitHubRepo('https://api.github.com/',
			'https://github.com/tatgean/skygear-squirrel-endpoint-test',
            'a4d21c9c7595353370ad55de6991b9cbb519c75f'
		);
		return requestResolver.resolve(gitHubRepo, '0.1.0', 'osx').then(result => {
			expect(result).to.deep.equal({
				statusCode: 200,
				body: {
					url: `${process.env.SQUIRREL_HOST}/${process.env.SQUIRREL_DOWNLOADS_PATH}/osx/1.0.0`
				}
			})
		})
	});

	it('/downloads/:platform/:version', () => {
        const gitHubRepo = new GitHubRepo('https://api.github.com/',
            'https://github.com/tatgean/skygear-squirrel-endpoint-test',
            'a4d21c9c7595353370ad55de6991b9cbb519c75f'
        );
        const downloadResolver = new DownloadResolver(gitHubRepo);
        return downloadResolver.resolve('osx', '1.0.0').then(result => {
        	console.log(result);
		});
	}).timeout(5000)
});