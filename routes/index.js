var express = require('express');
var router = express.Router();
var config = require('../config');
var T411 = require('t411');

var client = new T411();

/* GET home page. */
router.get('/', function (req, res) {
    res.redirect('/top/100');
});

router.get('/search', function (req, res) {
    client.auth(config.auth.login, config.auth.password, function (err) {
        if (err) throw err;
        
        var offset = typeof req.query.offset == 'undefined' ? 0 : parseInt(req.query.offset);
        
        client.get('/torrents/search/' + req.query.q, { limit: 100,offset: offset }, function (err, results) {
            if (err) throw err;
            var previousOffset = (offset - 100 < 0) ? 0 : offset - 100;
            var previousClass = (previousOffset == 0) ? 'disabled' : '';
            var nextOffset = offset + 100 > results.total ? offset: offset + 100;
            var nextClass = (nextOffset == offset) ? 'disabled' : '';
            res.render('search', 
                {
                results: results.torrents, 
                offset: results.offset, 
                total: results.total, 
                query: results.query,
                previousOffset: previousOffset,
                previousClass: previousClass,
                nextOffset: nextOffset,
                nextClass: nextClass
            });
        });


    });       
});

router.get('/top/:top', function (req, res) {
    var top = req.params.top;
    client.auth(config.auth.login, config.auth.password, function (err) {
        if (err) throw err;
        client.top(top, function (err, results) {
            if (err) throw err;
            res.render('results', { results: results });
        });
    });
});

router.get('/now', function (req, res) {
    res.render('now', { streamingProcesses: config.streamingProcesses });
});

router.get('/stop/:id', function (req, res) {
    var id = req.params.id;
    for (var i = 0; i < config.streamingProcesses.length; i++) {
        var streamingProcess = config.streamingProcesses[i];
        if (streamingProcess.id == id) {
            process.kill(streamingProcess.pid, 'SIGHUP');
            config.streamingProcesses.splice(i, 1);
        }
    }
    res.redirect("/now");
});

router.get('/stream/:id', function (req, res) {
    var id = req.params.id;
    client.auth(config.auth.login, config.auth.password, function (err) {
        if (err) throw err;
        
        client.download(id, function (err, buf) {
            var fs = require('fs');
            var filename = "/tmp/" + id + ".torrent";
            fs.writeFile(filename, buf, function (err) {
                if (err) throw err;
                var getport = require('getport');
                var isWin = process.platform === 'win32';
                
                var streamUrl = false;
                for (var i = 0; i < config.streamingProcesses.length; i++) {
                    if (id == config.streamingProcesses[i].id) {
                        streamUrl = config.streamingProcesses[i].streamUrl;
                        res.render('stream', { streamUrl: streamUrl });
                    }
                }

                if (!streamUrl) {
                    getport(8889, 8999, function (e, port) {
                        if (e) {
                            throw e;
                        }
                        
                        var osSpecificCommand = isWin ? 'cmd' : 'peerflix';
                        var osSpecificArgs = isWin ? ['/c', 'peerflix', filename, '--port=' + port] : [filename, '--port=' + port];
                        var childStream = require('child')({
                            command: osSpecificCommand,
                            args: osSpecificArgs,
                            cbStdout: function (data) {
                                console.log(String(data));
                            }
                        });
                        
                        childStream.start(function (pid) {
                            
                            var webPort = process.env.PORT || 3000;
                            streamUrl = 'http://' + req.headers.host.replace(':' + webPort, '') + ':' + port + "/";
                            client.get('/torrents/details/' + id, function (err, details) {
                                if (err) throw err;
                                config.streamingProcesses.push({
                                    pid: pid,
                                    id: id,
                                    streamUrl: streamUrl,
                                    details: details
                                });
                                res.render('stream', { streamUrl: streamUrl });
                            });
                        });

                    });
                }
            }); 
        });        
    });
});

module.exports = router;