var http = require('http');
var express = require('express');
var cors = require('cors');
var request = require('superagent');

daemon = express();
daemon.use(cors());
daemon.use(express.bodyParser());

daemon.post('/auth/login', function(req, res){
  request.post('https://verifier.login.persona.org/verify')
    .send({
      assertion: req.body.assertion,
      audience: 'http://localhost:8080'
    })
    .end(function(vres){
      console.log(vres.body);
      res.json(vres.body);
    });
});

daemon.post('/auth/logout', function(req, res){
  console.log(req.body.assertion);
  res.send(200);
});

var server = http.createServer(daemon);
server.listen(9000);
