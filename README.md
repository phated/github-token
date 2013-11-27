github-token
============

Login with GitHub and retrieve an access token

## Usage

### configuration

Configuration can be done with a config object or with environment variables

```js
// config object
var githubToken = require('github-token')({
  githubClient: 'YOUR_CLIENT_KEY',
  githubSecret: 'YOUR_GITHUB_SECRET',
  baseURL: 'http://localhost',
  callbackURI: '/callback',
  scope: 'user' // optional, default scope is set to user
});

// environment variables
var githubToken = require('github-token')();
```

Environment variables are used if a config object isn't passed, and include

* `GITHUB_CLIENT`
* `GITHUB_SECRET`
* `GITHUB_BASE_URL`
* `GITHUB_CALLBACK_URI`
* `GITHUB_SCOPE`

### login

`login` is passed the request and response objects, and redirects to GitHub OAuth login

```js
require('http').createServer(function(req, res){
  if(req.url.match(/login/)){
    return githubToken.login(req, res);
  }
}).listen(80);
```

### callback

`callback` returns a promise or takes a callback

```js
// promise
require('http').createServer(function(req, res){
  if(req.url.match(/callback/)){
    return githubToken.callback(req, res)
      .then(function(token){
        req.session.token = token;
      });
  }
}).listen(80);

// callback
require('http').createServer(function(req, res){
  if(req.url.match(/callback/)){
    return githubToken.callback(req, res, function(err, token){
      req.session.token = token;
    });
  }
}).listen(80);
```

## What about [github-oauth](https://github.com/maxogden/github-oauth)

I took a lot of inspiration from github-oauth, but didn't like the evented model.
Especially, when the config is done globally to an app or you need to access the request again.

I removed the loginURI option, because there is no route sugar, but all other options are the same.

Example:

```js
var githubToken = require('github-token')({
  githubClient: process.env['GITHUB_CLIENT'],
  githubSecret: process.env['GITHUB_SECRET'],
  baseURL: 'http://localhost',
  callbackURI: '/callback',
  scope: 'user' // optional, default scope is set to user
});

require('http').createServer(function(req, res){
  if(req.url.match(/login/)){
    return githubToken.login(req, res);
  }
  if(req.url.match(/callback/)){
    return githubToken.callback(req, res)
      .then(function(token){
        req.session.token = token;
      });
  }
}).listen(80);
```
