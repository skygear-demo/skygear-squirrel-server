'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var releaseParser = require('../src/release-parser');

describe('release-parser', function () {
    it('parse()', function () {
        var result = releaseParser.parse({
            "tag_name": "v0.1.0",
            "prerelease": false,
            "assets": [
                {
                    "id": 1,
                    "name": "osx.zip"
                },
                {
                    "id": 2,
                    "name": "win.exe"
                },
            ]
        });
        expect(result).to.deep.equal({
            version: '0.1.0',
            prerelease: false,
            osx: {
                id: 1,
                name: 'osx.zip'
            },
            win: {
                id: 2,
                name: 'win.exe'
            }
        })
    })

    it('parse() version no "v"', function () {
        var result = releaseParser.parse({
            "tag_name": "0.1.0",
            "prerelease": false,
            "assets": [
                {
                    "id": 1,
                    "name": "osx.zip"
                },
                {
                    "id": 2,
                    "name": "win.exe"
                },
            ]
        });
        expect(result).to.deep.equal({
            version: '0.1.0',
            prerelease: false,
            osx: {
                id: 1,
                name: 'osx.zip'
            },
            win: {
                id: 2,
                name: 'win.exe'
            }
        })
    })

    it('parse() invalid version number', function () {
        expect(releaseParser.parse.bind(releaseParser, {
            "tag_name": "a.b.c",
            "prerelease": false,
            "assets": [
                {
                    "id": 1,
                    "name": "osx.zip"
                },
                {
                    "id": 2,
                    "name": "win.exe"
                },
            ]
        })).to.throw(`Invalid version number - a.b.c. Your version number must follow SemVer.`);
    })

    it('parse() no asset for specific version', function () {
        var result = releaseParser.parse({
            "tag_name": "0.1.0",
            "prerelease": false,
            "assets": [
                {
                    "id": 1,
                    "name": "osx.zip"
                }
            ]
        });
        expect(result).to.deep.equal({
            version: '0.1.0',
            prerelease: false,
            osx: {
                id: 1,
                name: 'osx.zip'
            }
        })
    })

    it('parse() osx assets file extension priority', function () {
        var result = releaseParser.parse({
            "tag_name": "0.1.0",
            "prerelease": false,
            "assets": [
                {
                    "id": 1,
                    "name": "osx.zip"
                },
                {
                    "id": 2,
                    "name": "osx.dmg"
                },
            ]
        });
        expect(result.osx.id).to.equal(2);
    })

    it('parse() win assets file extension priority', function () {
        var result = releaseParser.parse({
            "tag_name": "0.1.0",
            "prerelease": false,
            "assets": [
                {
                    "id": 1,
                    "name": "win.zip"
                },
                {
                    "id": 2,
                    "name": "win.exe"
                },
            ]
        });
        expect(result.win.id).to.equal(2);
    })
})

