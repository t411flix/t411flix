# T411Flix
A nodejs web server to stream torrents from t411.io built using Express and Peerflix. Inspired by yify pop

## Installation

1. Install peerflix: `[sudo] npm install -g peerflix`

2. Cd to your directory

3. Install dependancies: `npm install`

4. Edit config.js and set your login and password

5. Start the server: `node bin/www`

## Issue

if you have this error:
`
undefined:1
string(5) "1.2.4"
^
SyntaxError: Unexpected token s
`

edit node_modules/t411/index.js and change API_HOST to api.t411.in

Thanks to HazCod for pointing this out

