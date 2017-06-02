'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const GitHubRepo = require('../src/GitHubRepo');
const requestResolver = require('../src/request-resolver');

describe.skip('Integration test', () => {
	it('all components should work together', () => {
		const gitHubRepo = new GitHubRepo('https://api.github.com/',
			'https://github.com/tatgean/skygear-squirrel-endpoint-test', 
			null
		);
		return requestResolver.resolve(gitHubRepo, '0.1.0', 'osx').then(result => {
			expect(result).to.deep.equal({
				statusCode: 200,
				body: {
					url: 'https://github.com/tatgean/skygear-squirrel-endpoint-test/releases/download/v1.0.0/testing-osx.zip'
				}
			});
		});
	});
});