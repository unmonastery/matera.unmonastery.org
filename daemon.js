var http = require('http');
var express = require('express');
var cors = require('cors');
var request = require('superagent');
var md5 = require('js-md5');
var lg = require('levelgraph');
var lgJSONLD = require('levelgraph-jsonld');

var db = lgJSONLD(lg('dev.ldb'));

daemon = express();
daemon.use(cors({ origin: true, credentials: true }));
daemon.use(express.bodyParser());
daemon.use(express.cookieParser('Thalugnesfit0drowAbJaskEbyocyut'));
daemon.use(express.cookieSession({ secret: 'RovFosithyltyojdykCadWysdurt2onn' })); //FIXME CSRF


daemon.post('/auth/login', function(req, res){
  request.post('https://verifier.login.persona.org/verify')
    .send({
      assertion: req.body.assertion,
      audience: 'http://localhost:8080'
    })
    .end(function(vres){ //FIXME extract into function
      // generate md5 hash for gravatar
      vres.body.md5email = md5(vres.body.email);

      // start session
      req.session.agent = vres.body;

      res.json(vres.body);

      // debug
      console.log(req.session);
    });
});

daemon.post('/auth/logout', function(req, res){
  console.log(req.body.assertion); //FIXME decide if needs assertion
  console.log(req.session); //debug
  req.session = null;
  res.send(200);
});

var context = {
  '@vocab': 'http://schema.org/',
  '@base': 'https://unmonastery.net/'
};

function savePerson (req, res){
  var person = req.body;
  if(req.session.agent.email === person.email){
    person['@context'] = context;
    db.jsonld.del(context['@base'] + person['@id'], function(err){
      if(err) return console.error(err);
      db.jsonld.put(person, function(err){
        if(err) return console.error(err);
        console.log('SAVED:', person);
        res.send(200);
      });
    });
  } else {
    console.log('REJECTED:', req.body);
    res.send(403);
  }
}

daemon.get('/people', function(req, res){
});

daemon.get('/people/:part', function(req, res){
  var id = 'https://unmonastery.net/people/' + req.params.part;
  console.log(id);
  db.jsonld.get(id, { '@context': context }, function(err, obj){
    console.log(obj);
    res.json(obj);
  });
});
daemon.post('/people/:part', savePerson);
daemon.put('/people/:part', savePerson);


var server = http.createServer(daemon);
server.listen(9000);
