(function() {

  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  function addRowFn() {
    var content = search.innerHTML.replace(/^\s+|\s*(<br *\/?>)?\s*$/g,"");
    var contentList = content.split(/\s*<br ?\/?>\s*/);
    var lastSong = contentList[contentList.length - 2];
    num = parseInt(lastSong.charAt(lastSong.length - 2)) + 1;
    var newSong = "song" + num;
    $(search).append('Song ' + num + ': <br>');
    $(search).append('<input type="text" id=' + newSong + '>');
    $(search).append('<br>');
  }

  function getRecs(songIDs) {
    $.ajax({
      url: '/recs',
      data: {
        'songs': songIDs,
        'access': access_token
      }
    }).done(function(data) {
      console.log(data.preview);
    });
  }

  var userProfileSource = document.getElementById('user-profile-template').innerHTML,
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = document.getElementById('user-profile');

  var oauthSource = document.getElementById('oauth-template').innerHTML,
      oauthTemplate = Handlebars.compile(oauthSource),
      oauthPlaceholder = document.getElementById('oauth');

  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  var num = 3;

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {
      // render oauth info

      oauthPlaceholder.innerHTML = oauthTemplate({
        access_token: access_token,
        refresh_token: refresh_token
      });

      $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);

            $('#login').hide();
            $('#loggedinSearch').show();
          }
      });
    } else {
        // render initial screen
        $('#login').show();
        $('#loggedinSearch').hide();
    }

    document.getElementById('obtain-new-token').addEventListener('click', function() {
      $.ajax({
        url: '/refresh_token',
        data: {
          'refresh_token': refresh_token
        }
      }).done(function(data) {
        access_token = data.access_token;
        oauthPlaceholder.innerHTML = oauthTemplate({
          access_token: access_token,
          refresh_token: refresh_token
        });
      });
    }, false);

    document.getElementById('submit').addEventListener('click', function() {
      var songName = "";
      var songIDs = [];
      console.log(songIDs);
      for (var i=1; i < num+1; i++) {
        songName = "song" + i;
        var song = document.getElementById(songName).value;
        $.ajax({
          url: '/search',
          data: {
            'song': song,
            'access': access_token
          }
        }).done(function(data) {
          console.log(data.preview);
          songIDs.push(data.song);
          console.log(songIDs);
          if (songIDs.length == num) {
            console.log('searching complete!');
            getRecs(songIDs);
          }
        });
      }
      console.log(songIDs);
    }, false);

    document.getElementById('addRow').addEventListener('click', function() {
      addRowFn();
    }, false);
  }
})();

