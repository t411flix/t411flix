# T411Flix
A nodejs web server to stream torrents from t411.io built using Express and Peerflix. Inspired by yify pop

## Installation

1. Install peerflix: `[sudo] npm install -g peerflix`

2. Cd to your directory

3. Install dependancies: `npm install`

4. Edit config.js and set your login and password

5. Start the server: `T411_API_HOST=api.t411.al node bin/www`

## Issue

if you have an error:

`Hostname/IP doesn't match certificate's altnames`

check the api hostname
