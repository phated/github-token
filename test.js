var githubOAuth = require('./')();

require('http').createServer(function(req, res) {
  if (req.url.match(/login/)) return githubOAuth.login(req, res);
  if (req.url.match(/callback/)) return githubOAuth.callback(req, res, function(err, data){
    console.log(err, data);
    res.end(JSON.stringify(data));
  });
}).listen(9000);
