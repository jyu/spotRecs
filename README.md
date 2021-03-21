# spotRecs   
Recommendations and Playlist Visualizations with Spotify

I use Spotify all the time and I'm constantly on the hunt for new songs, so I developed SpotRecs, a web application that 1) recommends songs to users based on input seed songs and 2) visualizes playlists. It utilizes Spotify's API in order to process and analyze songs, allowing users to know more about what music they enjoy.

Built with Express, Node.js, Bootstrap, Handlebars, Request, Spotify API, Heroku, Highcharts

March 2017 - Aug 2017

# Screenshots
## Playlist Visualization
Selecting a playlist
![playlists](https://user-images.githubusercontent.com/22227349/111894740-80aaac00-89ca-11eb-9b52-23539725ad75.JPG)

Visualized results in 2D, each point represents a song. The distance between songs represents how close they are in features.
![graph](https://user-images.githubusercontent.com/22227349/111894745-87d1ba00-89ca-11eb-82f0-71d8742821c8.JPG)

For visualization, features are extracted from each song via Spotify API and the dimensions are then reduced with the t-SNE algorithm. t-SNE, or t-distributed stochastic neighbor embedding uses a probablilistic model to preserve distances between multidimensional vectors while projecting vectors into 2d space.

References:

[Visualizing Hundreds of My Favorite Songs on Spotify by Dimitris Spathis](https://medium.com/cuepoint/visualizing-hundreds-of-my-favorite-songs-on-spotify-fe50c94b8af3)

[t-SNE implementation in js by science.ai](https://github.com/scienceai/tsne-js)

## Song Recommendation
Searching for songs and viewing the resulting recommendations

![recommendations](https://user-images.githubusercontent.com/22227349/111894765-b8b1ef00-89ca-11eb-850c-3c735e82dac8.png)

Analysis of the resulting songs, comparing different attributes of each song

![analysis](https://user-images.githubusercontent.com/22227349/111894770-bea7d000-89ca-11eb-8d65-15d07859cace.png)



