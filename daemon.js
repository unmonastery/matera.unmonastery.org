var fs = require('fs');
var http = require('http');
var express = require('express');
var cors = require('cors');
var request = require('superagent');
var lg = require('levelgraph');
var lgJSONLD = require('levelgraph-jsonld');
var _ = require('lodash');
var async = require('async');
var oembed = require('oembed-auto');
var config = require('./config/daemon');

var db = lgJSONLD(lg(config.db));

daemon = express();
daemon.use(cors({ origin: true, credentials: true }));
daemon.use(express.bodyParser());
daemon.use(express.cookieParser(config.secrets.cookie));
daemon.use(express.cookieSession({ secret: config.secrets.session })); //FIXME CSRF

daemon.post('/auth/login', function(req, res){
  if(_.contains(config.audiences, req.headers.origin)){
    request.post('https://verifier.login.persona.org/verify')
      .send({
        assertion: req.body.assertion,
        audience: req.headers.origin
      })
      .end(function(vres){ //FIXME extract into function

        // start session
        req.session.agent = vres.body;

        res.json(vres.body);
      });
  } else {
    res.send(403);
  }
});

daemon.post('/auth/logout', function(req, res){
  req.session = null;
  res.send(200);
});

daemon.post('/oembed', function(req, res){
  oembed(req.body.url, function(err, data){
    res.end(data.html);
  });
});

var context = JSON.parse(fs.readFileSync('unmonastery.jsonld').toString());

function savePerson (req, res){
  var person = req.body;
  if(req.session.agent.email === person.email){
    db.jsonld.del(context['@base'] + person['@id'], function(err){
      if(err) return console.error(err);
      db.jsonld.put(person, function(err){
        if(err) return console.error(err);
        res.send(200);
      });
    });
  } else {
    res.send(403);
  }
}

function saveProject (req, res){
  var project = req.body;
  var id = context['@base'] + project['@id'];
  db.jsonld.get(id, context, function(err, proj){
    db.jsonld.get(context['@base'] + proj.founder, context, function(err, founder){
      if(req.session.agent.email === founder.email){ // FIXME suport multiple founders
        db.jsonld.del(id, function(err){
          if(err) return console.error(err);
          db.jsonld.put(project, function(err){
            if(err) return console.error(err);
            res.send(200);
          });
        });
      } else {
        res.send(403);
      }
    });
  });
}

// FIXME move to graph data!
var editors = [
  'perpetual-tripper@wwelves.org',
  'kei@ourmachine.net',
  'ben@vickers.tv'
];

function savePage(req, res){
  if(_.contains(editors, req.session.agent.email)){
    var page = req.body;
    var id = context['@base'] + page['@id'];
    db.jsonld.get(id, context, function(err, pg){
      db.jsonld.del(id, function(err){
        if(err) return console.error(err);
        db.jsonld.put(page, function(err, obj){
          if(err) return console.error(err);
          res.send(200);
        });
      });
    });
  } else {
    res.send(403);
  }
}

// FIXME !!!DRY!!!
daemon.get('/people', function(req, res){
  db.get({
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://schema.org/Person'
  }, function(err, triples){
    async.map(triples, function(triple, callback){
      db.jsonld.get(triple.subject, context, function(error, obj){
        callback(error, obj);
      }.bind(this));
    }, function(error, people){
      if(error) return console.log(error);
      res.json(people);
    });
  });
});

daemon.get('/projects', function(req, res){
  db.get({
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://schema.org/Organization'
  }, function(err, triples){
    async.map(triples, function(triple, callback){
      db.jsonld.get(triple.subject, context, function(error, obj){
        callback(error, obj);
      }.bind(this));
    }, function(error, people){
      if(error) return console.log(error);
      res.json(people);
    });
  });
});

daemon.get('/pages', function(req, res){
  db.get({
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://schema.org/WebPage'
  }, function(err, triples){
    async.map(triples, function(triple, callback){
      db.jsonld.get(triple.subject, context, function(error, obj){
        callback(error, obj);
      }.bind(this));
    }, function(error, pages){
      if(error) return console.log(error);
      res.json(pages);
    });
  });
});

daemon.get('/people/:part', function(req, res){
  var id = 'http://unmonastery.net/people/' + req.params.part;
  db.jsonld.get(id, { '@context': context }, function(err, obj){
    res.json(obj);
  });
});
daemon.post('/people/:part', savePerson);
daemon.put('/people/:part', savePerson);

daemon.post('/projects/:part', saveProject);
daemon.put('/projects/:part', saveProject);

daemon.post('/pages/:part', savePage);
daemon.put('/pages/:part', savePage);

var server = http.createServer(daemon);
server.listen(config.port);
