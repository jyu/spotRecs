/**
*   Based on Spotify authoritization guide
 */
// Spotify rest api,  Express.Js, Request, Jquery, Handlebars

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = 'd8c54aed95f045b991861e7d94b14f8f'; // Your client id
var client_secret = '32acd5e02e934ec0b514a7b58ff1fa80'; // Your secret
var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/view'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        // var options = {
        //   url: 'https://api.spotify.com/v1/me',
        //   headers: { 'Authorization': 'Bearer ' + access_token },
        //   json: true
        // };

        // // use the access token to access the Spotify Web API
        // request.get(options, function(error, response, body) {
        //    console.log(body);
        // });

        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/search', function(req, res) {
  var access_token = req.query.access;
  var song = req.query.song;
  var url = 'https://api.spotify.com/v1/search?q=' +
             song.replace(/ /g, "+") +
             '&type=track'
  var options = {
    url: url,
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200 && body.tracks.total != 0) {
      var song = body.tracks.items[0];
      res.send({
        'song': song,
        'preview': song.preview_url
      });
    } else {
      res.send({
        'song': 'error',
        'preview': 'error'
      });
    }
  });
});

app.get('/recs', function(req, res) {
  var access_token = req.query.access;
  var songs = req.query.songs;
  var url = 'https://api.spotify.com/v1/recommendations?seed_tracks=';
  for (var i = 0; i < songs.length; i++) {
    url += songs[i] + ",";
  }
  var options = {
    url: url,
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var songs = body.tracks;
      res.send({
        'songs': songs
      });
    } else {
      res.send({
        'songs': 'error'
      });
    }
  });
});

app.get('/stats', function(req, res) {
  var access_token = req.query.access;
  var song = req.query.song;
  var key = req.query.key;
  var url = 'https://api.spotify.com/v1/audio-features/' + song;
  var options = {
    url: url,
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // Adjust stats to from 0-10
      res.send({
        'key': key,
        'stats': {
          'key': key,
          'd': (body.danceability * 10).toFixed(2),
          'e': (body.energy * 10).toFixed(2),
          'a': (body.acousticness * 10).toFixed(2),
          'v': (body.valence * 10).toFixed(2),
          't': (body.tempo / 20).toFixed(2)
        }
      });
    } else {
      res.send({
        'key': 'error',
        'stats': {
          'd': 'error',
          'e': 'error',
          'a': 'error',
          'v': 'error',
          't': 'error'
        }
      });
    }
  });
});

app.listen(process.env.PORT || 3000);
