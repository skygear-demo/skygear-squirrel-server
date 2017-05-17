'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const DownloadResolver = require('../src/download-resolver');
const GitHubRepo = require('../src/GitHubRepo');
const ServerMock = require("mock-http-server");

describe('download-resolver', () => {
    const server = new ServerMock({ host: "localhost", port: 9000 });

    beforeEach(function(done) {
        server.start(done);
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('resolve()', () => {
        const assetId = 1;
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases',
            reply: {
                status: 200,
                body: JSON.stringify([
                    {
                        tag_name: 'v1.0.0',
                        prerelease: false,
                        assets: [
                            {
                                id: assetId,
                                name: 'osx.zip'
                            }
                        ]
                    }
                ])
            }
        });
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases/assets/' + assetId,
            reply: {
                status: 200,
                body: 'some-data'
            }
        });
        const host = 'http://localhost:9000/';
        const repoUrl = 'some-user/some-repo';
        const accessToken = null;
        const githubRepo = new GitHubRepo(host, repoUrl, accessToken);
        const resolver = new DownloadResolver(githubRepo);
        return resolver.resolve('osx', '1.0.0').then(result => {
            expect(result).to.equal('some-data');
        })
    });

    it('resolve() invalid platform', () => {
        const assetId = 1;
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases',
            reply: {
                status: 200,
                body: JSON.stringify([
                    {
                        tag_name: 'v1.0.0',
                        prerelease: false,
                        assets: [
                            {
                                id: assetId,
                                name: 'osx.zip'
                            }
                        ]
                    }
                ])
            }
        });
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases/assets/' + assetId,
            reply: {
                status: 200,
                body: 'some-data'
            }
        });
        const host = 'http://localhost:9000/';
        const repoUrl = 'some-user/some-repo';
        const accessToken = null;
        const githubRepo = new GitHubRepo(host, repoUrl, accessToken);
        const resolver = new DownloadResolver(githubRepo);
        return expect(resolver.resolve('an-invalid-platform', '1.0.0')).to.be.rejectedWith('Invalid platform - an-invalid-platform');
    });

    it('resolve() no such version', () => {
        const assetId = 1;
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases',
            reply: {
                status: 200,
                body: JSON.stringify([
                    {
                        tag_name: 'v1.0.0',
                        prerelease: false,
                        assets: [
                            {
                                id: assetId,
                                name: 'osx.zip'
                            }
                        ]
                    }
                ])
            }
        });
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases/assets/' + assetId,
            reply: {
                status: 200,
                body: 'some-data'
            }
        });
        const host = 'http://localhost:9000/';
        const repoUrl = 'some-user/some-repo';
        const accessToken = null;
        const githubRepo = new GitHubRepo(host, repoUrl, accessToken);
        const resolver = new DownloadResolver(githubRepo);
        return expect(resolver.resolve('osx', '2.0.0')).to.be.rejectedWith('Asset not found');
    });

    it('resolve() no assets found', () => {
        const assetId = 1;
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases',
            reply: {
                status: 200,
                body: JSON.stringify([
                    {
                        tag_name: 'v1.0.0',
                        prerelease: false,
                        assets: [
                            {
                                id: assetId,
                                name: 'win.zip'     // no osx version available
                            }
                        ]
                    }
                ])
            }
        });
        server.on({
            method: 'GET',
            path: '/repos/some-user/some-repo/releases/assets/' + assetId,
            reply: {
                status: 200,
                body: 'some-data'
            }
        });
        const host = 'http://localhost:9000/';
        const repoUrl = 'some-user/some-repo';
        const accessToken = null;
        const githubRepo = new GitHubRepo(host, repoUrl, accessToken);
        const resolver = new DownloadResolver(githubRepo);
        return expect(resolver.resolve('osx', '1.0.0')).to.be.rejectedWith('Asset not found');
    });
});
