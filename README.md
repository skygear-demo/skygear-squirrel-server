# skygear-squirrel-endpoint
A squirrel endpoint running on [Skygear Cloud Code](https://docs.skygear.io/guides/cloud-function/intro-and-deployment/python/) using GitHub as a backend.


# How to deploy
1. [Register an account](https://portal.skygear.io/signup) on Skygear.io if you haven't yet.

2. [Signin to your account](https://portal.skygear.io/login) on Skygear.io.

3. Go to [Settings](https://portal.skygear.io/app/ourskyty/settings), add the following environment variables:
    * `GITHUB_REPO` = `<your-repo-url>`
    * `GITHUB_ACCESS_TOKEN` = `<your-github-access-token>` 
    
    [Obtain an access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/#creating-a-token) if you haven't got one yet
    
4. Clone this repository by running `git clone https://github.com/tatgean/skygear-squirrel-endpoint.git`

5. Follow [this guide](https://docs.skygear.io/guides/cloud-function/intro-and-deployment/python/#cloud-functions-deployment) to deploy the code to Skygear Cloud Code.

6. Go to `https://your-skygear-cloud-url/getInfo` to verify if the deployment is successful.

# Releasing your updates
1. Your should release your updates to the `GITHUB_REPO` GitHub repository you provided above.

2. The tag name of each release MUST follow [SemVer](http://semver.org).

3. Attach your binaries as assets to the release.
   * skygear-squirrel-endpoint will search for `osx` in your filename to determine if it is for osx
   * skygear-squirrel-endpoint will search for `win` in your filename to determine if it is for windows.
  

# Endpoints
`/update?platform={platform}&version={current-version}`:
* if update available, return with status code `200`, and 
    ```
    {
      "url": "<download-url>"
    }
    ```
* if no updates available, return with status code `204`

# Update resolve strategy
1. If the latest version > current version, return the latest version.
   > Example:
   > ###### Releases on GitHub: 
   > v1.5.0 - myapp-osx.zip
   >
   > v1.0.0 - myapp-osx.zip
   > ###### Request:
   > `/update?platform=osx&version=1.0.0`: 
   > ###### Response
   > `200 OK` - `{"url": "https://your-github-repo-url/v1.5.0/myapp-osx.zip"}`
2. If the latest version <= current version, return 204 No Content.
   > Example:
   > ###### Releases on GitHub: 
   > v1.5.0 - `myapp-osx.zip`, `myapp-win.exe`
   >
   > v1.0.0 - `myapp-osx.zip`, `myapp-win.exe`
   > ###### Request:
   > `/update?platform=osx&version=1.5.0`: 
   > ###### Response
   > `204 No Content`
3. Pre-releases are ignored.
   > Example:
   > ###### Releases on GitHub: 
   > v2.0.0(pre-release) - `myapp-osx.zip`, `myapp-win.exe`
   >
   > v1.5.0 - `myapp-osx.zip`, `myapp-win.exe`
   >
   > v1.0.0 - `myapp-osx.zip`, `myapp-win.exe`
   > ###### Request:
   > `/update?platform=osx&version=1.0.0`: 
   > ###### Response
   > `200 OK` - `{"url": "https://your-github-repo-url/v1.5.0/myapp-osx.zip"}`
4. Releases not following [SemVer](http://semver.org) as their tag are ignored.
   > Example:
   > ###### Releases on GitHub: 
   > v2.awww.yeahhhh - `myapp-osx.zip`, `myapp-win.exe`
   >
   > v1.5.0 - `myapp-osx.zip`, `myapp-win.exe`
   >
   > v1.0.0 - `myapp-osx.zip`, `myapp-win.exe`
   > ###### Request:
   > `/update?platform=osx&version=1.0.0`: 
   > ###### Response
   > `200 OK` - `{"url": "https://your-github-repo-url/v1.5.0/myapp-osx.zip"}`
5. Releases without assets for target platform are ignored.
   > Example:
   > ###### Releases on GitHub: 
   > v2.0.0 - `myapp-win.exe`  //no assets for osx
   >
   > v1.5.0 - `myapp-osx.zip`, `myapp-win.exe`
   >
   > v1.0.0 - `myapp-osx.zip`, `myapp-win.exe`
   > ###### Request:
   > `/update?platform=osx&version=1.0.0`: 
   > ###### Response
   > `200 OK` - `{"url": "https://your-github-repo-url/v1.5.0/myapp-osx.zip"}`
