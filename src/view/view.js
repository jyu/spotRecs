(function() {
    function notify(el) {
      $('html, body').animate({scrollTop:$(document).height()}, 'slow');

      $('#visualizing').show();
      $('#playlistAna').hide();
      $('#playlistAnaHeader').hide();
      $('#login').hide();
      $('#loggedinSearch').show();
      $('#user-profile').hide();
      $('#searching').hide();
      $('#resultsBtn').hide();
      $('#results').hide();
      $('#analysis').hide();
      $('#analysisHeader').hide();
      $('#analysisBtn').hide();

      console.log(el.innerHTML)
         $.ajax({
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            // Get the Playlist
            for (var i=0; i < response.items.length; i++) {
              if (response.items[i].name == el.innerHTML) {
                var pl = response.items[i]
              }
            }
            console.log(pl)
            console.log(pl.tracks.href)
            // Get the tracks
            var numRes = 0
            var total = 0
            var names = []
            var ids = ""
            var idList = []
            $.ajax({
              async: false,
              url: pl.tracks.href,
              headers: {
                'Authorization': 'Bearer ' + access_token
              },
              success: function(response) {
                numRes += response.items.length
                total = response.total
                for (var i=0; i < response.items.length; i++) {
                  if (String(response.items[i].track.id) != "null") {
                    names.push(response.items[i].track.name)
                    ids += response.items[i].track.id + ","
                  }
                }
                idList.push(ids.substring(0,ids.length-1));
                ids = "";
              }
            });

            while (numRes < total) {
              $.ajax({
                async: false,
                url: pl.tracks.href + "?offset=" + String(numRes) + "&limit=100",
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  console.log(response)
                  numRes += response.items.length
                  for (var i=0; i < response.items.length; i++) {
                    if (String(response.items[i].track.id) != "null") {
                      names.push(response.items[i].track.name)
                      ids += response.items[i].track.id + ","
                    }
                  }
                  idList.push(ids.substring(0,ids.length-1));
                  ids = "";
                }
              });
            }
            console.log(numRes)
            console.log(names)
            $.ajax({
              url: '/analyze',
              data: {
                'names': names,
                'songids':idList,
                'access': access_token
              }
            }).done(function(data) {
              $('html, body').animate({scrollTop:$(document).height()}, 'slow');

              $('#visualizing').hide();
              $('#playlistAna').show();
              $('#playlistAnaHeader').show();

              console.log(data)
              var series = []
              for (var i=0; i < data.stats.length; i++) {
                series.push({
                  name: names[i],
                  color: 'rgba(223, 83, 83, .5)',
                  data: [data.stats[i]],
                  showInLegend: false
                })
              }

              Highcharts.chart('playlistAna', {
              chart: {
                  type: 'scatter',
                  zoomType: 'xy'
              },
              title: {
                  text: 'Songs from ' + el.innerHTML
              },
              subtitle: {
                  text: 'Source: Spotify API'
              },
              xAxis: {
                  visible: false,
                  lineWidth: 0,
                  title: {
                      enabled: false,
                      text: 'Height (cm)'
                  }
              },
              yAxis: {
                  visible: false,
                  lineWidth: 0,
                  title: {
                      enabled: false,
                      text: 'Weight (kg)'
                  }
              },
              plotOptions: {
                  scatter: {
                      marker: {
                          symbol: 'circle',
                          radius: 5
                      },
                      states: {
                          hover: {
                              marker: {
                                  enabled: false
                              }
                          }
                      },
                      tooltip: {
                          headerFormat: '<b>{series.name}</b><br>'
                      }
                  }
              },
              series: series
          });


            })

          }
      });
    }
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

  function updateNum(num) {
    var content = search.innerHTML.replace(/^\s+|\s*(<br *\/?>)?\s*$/g,"");
    var contentList = content.split(/\s*<br ?\/?>\s*/);
    var lastSong = contentList[contentList.length - 2];
    num = [parseInt(lastSong.charAt(lastSong.length - 2))];
    console.log(num);
    return num;
  }

  function addRowFn(num) {
    var content = search.innerHTML.replace(/^\s+|\s*(<br *\/?>)?\s*$/g,"");
    var contentList = content.split(/\s*<br ?\/?>\s*/);
    var lastSong = contentList[contentList.length - 2];
    num = [parseInt(lastSong.charAt(lastSong.length - 2)) + 1];
    var newSong = "song" + num[0];
    $(search).append('Song ' + num[0] + ': <br>');
    $(search).append('<input type="text" id=' + newSong + ' size = 35>');
    $(search).append('<br>');
  }

  function getStats(songIDs, songNames) {
    console.log('getting stats');
    if(typeof songIDs != 'undefined' && songIDs.length != 0) {
      var statistics = [0,0,0,0];
      var count = 0;
      for (var i=0; i < songIDs.length; i++) {
        console.log(count);
        console.log('song ' + i);
        var song = songIDs[i];
        $.ajax({
          url: '/stats',
          data: {
            'song': song,
            'access': access_token,
            'key': i
          }
        }).done(function(data) {
          if (data.key != 'error') {
            console.log(statistics);
            console.log(data.stats.key);
            statistics.splice(data.stats.key,1,data.stats);
            console.log(statistics[i]);
            count += 1;
          }
          if (count == 4) {
            console.log('Analysis done');

            var stats1 = statistics[0];
            var stats2 = statistics[1];
            var stats3 = statistics[2];
            var stats4 = statistics[3];
            dataPlaceholder.innerHTML = dataTemplate(
            {
              song1: songNames[0],
              song1D: stats1.d,
              song1E: stats1.e,
              song1A: stats1.a,
              song1V: stats1.v,
              song1T: stats1.t,
              song2: songNames[1],
              song2D: stats2.d,
              song2E: stats2.e,
              song2A: stats2.a,
              song2V: stats2.v,
              song2T: stats2.t,
              song3: songNames[2],
              song3D: stats3.d,
              song3E: stats3.e,
              song3A: stats3.a,
              song3V: stats3.v,
              song3T: stats3.t,
              song4: songNames[3],
              song4D: stats4.d,
              song4E: stats4.e,
              song4A: stats4.a,
              song4V: stats4.v,
              song4T: stats4.t
            });
          $('#analysis').show();
            $('#datatable').hide();
            var chart  = Highcharts.chart('analysis',{
              data: {
                  table: 'datatable'
              },
              chart: {
                  type: 'column'
              },
              title: {
                  text: 'Attributes Chart'
              },
              yAxis: {
                  allowDecimals: false,
                  title: {
                      text: 'Units'
                  }
              },
              tooltip: {
                  formatter: function () {
                      return '<b>' + this.series.name + '</b><br/>' +
                          this.point.y + ' ' + this.point.name.toLowerCase();
                  }
              }
            });
          $('#analysisHeader').show();
          $('#analysisBtn').show();
          $('html, body').animate({scrollTop:$(document).height()}, 'slow');
          document.getElementById('analysisButton').addEventListener('click', function() {
            $('html, body').animate({scrollTop:$(document)}, 'slow');
          }, false);

          }
        })
      }
    }
  }

  function getRecs(songIDs) {
    if(typeof songIDs != 'undefined' && songIDs.length != 0) {
      $.ajax({
        url: '/recs',
        data: {
          'songs': songIDs,
          'access': access_token
        }
      }).done(function(data) {
        if (data.songs != 'error') {
          console.log(data.songs.length);
          resultsPlaceholder.innerHTML = resultsTemplate(
          {
            song1: data.songs[0].name,
            song1Link: data.songs[0].preview_url,
            song1Artist:data.songs[0].artists[0].name,
            song2: data.songs[1].name,
            song2Link: data.songs[1].preview_url,
            song2Artist:data.songs[1].artists[0].name,
            song3: data.songs[2].name,
            song3Link: data.songs[2].preview_url,
            song3Artist:data.songs[2].artists[0].name,
            song4: data.songs[3].name,
            song4Link: data.songs[3].preview_url,
            song4Artist:data.songs[3].artists[0].name,
          });
          resultIDs = [
            data.songs[0].id,
            data.songs[1].id,
            data.songs[2].id,
            data.songs[3].id
          ]
          songNames = [
            data.songs[0].name,
            data.songs[1].name,
            data.songs[2].name,
            data.songs[3].name
          ]

          $('#results').show();
          $('#resultsBtn').show();
          $('html, body').animate({scrollTop:$(document).height()}, 'slow');
          $('#searching').hide();
          document.getElementById('resultsButton').addEventListener('click', function() {
            getStats(resultIDs, songNames);
          }, false);
        }
      });
    }
  }

  function searchSong(num, i, songIDs) {
    songName = "song" + i;
    console.log(songName);
    var song = document.getElementById(songName).value;
    $.ajax({
      url: '/search',
      data: {
        'song': song,
        'access': access_token
      }
    }).done(function(data) {
      if (data.song == 'error') {
        num[0] -= 1;
      } else {
        console.log(data.preview);
        songIDs.push(data.song.id);
      }
      if (songIDs.length == num[0]) {
        console.log('searching complete!');
        getRecs(songIDs);
      }
    });
  }

  function searchAll(num) {
    $('#analysis').hide();
    $('#analysisHeader').hide();
    $('#analysisBtn').hide();
    $('#playlistAna').hide();
    $('#playlistAnaHeader').hide();
    $('#visualizing').hide();

    $('#searching').show();
    var songName = "";
    var songIDs = [];
    num = updateNum(num);
    console.log(songIDs);
    for (var i=1; i < num[0]+1; i++) {
      searchSong(num, i, songIDs);
    }
  }

  var userProfileSource = document.getElementById('user-profile-template').innerHTML,
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = document.getElementById('user-profile');

  var resultsSource = document.getElementById('results-template').innerHTML,
      resultsTemplate = Handlebars.compile(resultsSource),
      resultsPlaceholder = document.getElementById('results');

  var dataSource = document.getElementById('data-template').innerHTML,
      dataTemplate = Handlebars.compile(dataSource),
      dataPlaceholder = document.getElementById('song-data');

  var playlistSource = document.getElementById('playlist-template').innerHTML,
      playlistTemplate = Handlebars.compile(playlistSource),
      playlistPlaceholder = document.getElementById('playlist-list');

  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  var num = [3]; // keeps track of how many songs

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {
        $.ajax({
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            console.log(response)
            // userProfilePlaceholder.innerHTML = userProfileTemplate(response);
            var playlist = []
            for (var i=0; i < response.items.length; i++) {
              playlist.push(response.items[i].name)
            }
            console.log(playlist)
            playlistPlaceholder.innerHTML = playlistTemplate({playlist:playlist});
            $('#playlist-list').show();
            $('#playlistAna').hide();
            $('#playlistAnaHeader').hide();
            $('#visualizing').hide();

            $('#login').hide();
            $('#loggedinSearch').show();
            $('#user-profile').hide();
            $('#searching').hide();
            $('#resultsBtn').hide();
            $('#analysis').hide();
            $('#analysisHeader').hide();
            $('#analysisBtn').hide();
            if (document.getElementById('playlists')) {
              document.getElementById('playlists').addEventListener('click', function(event) {
                notify(event.target);
              });
            }
          }
      });
    } else {
        // render initial screen
        $('#login').show();
        $('#loggedinSearch').hide();
    }

    document.getElementById('submit').addEventListener('click', function() {
      searchAll(num);
    }, false);

    document.getElementById('addRow').addEventListener('click', function() {
      addRowFn(num);
    }, false);

    if (document.getElementById('playlists')) {
      document.getElementById('playlists').addEventListener('click', function(event) {
        notify(event.target);
      });
    }
  }
})();

