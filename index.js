var url = require('url');
var crypto = require('crypto');
var path = require('path');

var when = require('when');
var nodefn = require('when/node/function');

var rest = require('rest');
var mime = require('rest/interceptor/mime');
var entity = require('rest/interceptor/entity');
var errorCode = require('rest/interceptor/errorCode');
var pathPrefix = require('rest/interceptor/pathPrefix');
var defaultRequest = require('rest/interceptor/defaultRequest');

var baseClient = rest
  .chain(mime, { mime: 'application/json' })
  .chain(pathPrefix, { prefix: 'https://github.com' })
  .chain(errorCode)
  .chain(entity);

function defaults(config){
  config = config || {};

  config.githubClient = config.githubClient || process.env.GITHUB_CLIENT;
  config.githubSecret = config.githubSecret || process.env.GITHUB_SECRET;
  config.baseURL = config.baseURL || process.env.GITHUB_BASE_URL;
  config.callbackURI = config.callbackURI || process.env.GITHUB_CALLBACK_URI || '/github/callback';
  config.scope = config.scope || process.env.GITHUB_SCOPE || 'user';

  return config;
}

module.exports = function(config){
  config = defaults(config);

  var state = crypto.randomBytes(8).toString('hex');

  var urlObj = url.parse(config.baseURL);
  urlObj.pathname = path.join(urlObj.pathname, config.callbackURI).replace(path.sep, '/'); // windows support
  var redirectURI = url.format(urlObj);

  var loginRedirect = url.format({
    protocol: 'https',
    host: 'github.com',
    pathname: '/login/oauth/authorize',
    query: {
      client_id: config.githubClient,
      scope: config.scope,
      redirect_uri: redirectURI,
      state: state
    }
  });

  var tokenClient = baseClient
    .chain(defaultRequest, {
      path: '/login/oauth/access_token',
      params: {
        client_id: config.githubClient,
        client_secret: config.githubSecret,
        state: state
      }
    });

  function login(req, resp){
    resp.statusCode = 302;
    resp.setHeader('location', loginRedirect);
    resp.end();
  }

  function callback(req, resp, cb){
    var query = url.parse(req.url, true).query;
    var code = query.code;

    if(!code){
      var err = new Error('missing oauth code');
      if(cb){
        cb(err);
      }
      return when.reject(err);
    }

    var request = tokenClient({
      params: {
        code: code
      }
    });

    return nodefn.bindCallback(request, cb);
  }

  return {
    login: login,
    callback: callback
  };
};
