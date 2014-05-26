module.exports = function(grunt){

  grunt.initConfig({
    connect: {
      app: {
        options: {
          port: 8080,
          hostname: '*',
          livereload: true
        }
      }
    },
    less : {
      development: {
        files: {
          "tmp/less-compile.css": "styles/variables-override.less"
        }
      }
    },
    handlebars: {
      compile: {
        options: {
          namespace: 'JST',
          processName: function(filePath){ return filePath.split('/')[1].replace('.hbs', ''); }
        },
        files: {
          'tmp/templates.js': 'templates/*.hbs'
        }
      }
    },
    develop: {
      daemon: {
        file: 'daemon.js'
      }
    },
    watch: {
      app: {
        files: ['app.js', 'tmp/templates.js', 'index.html'],
        options: {
          livereload: true
        }
      },
      handlebars: {
        files: ['templates/*.hbs'],
        tasks: ['handlebars']
      },
      daemon: {
        files: ['daemon.js'],
        tasks: ['develop'],
        options: {
          nospawn: true
        }
      }
    },
  });

  // app
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  // daemon
  grunt.loadNpmTasks('grunt-develop');

  // common
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['connect', 'less', 'handlebars', 'develop', 'watch']);

  grunt.registerTask('import', function(){
    var fs = require('fs');
    var lg = require('levelgraph');
    var lgJSONLD = require('levelgraph-jsonld');
    var config = require('./config/daemon');
    var db = lgJSONLD(lg(config.db));

    var data = JSON.parse(fs.readFileSync('data.jsonld').toString());
    var context = JSON.parse(fs.readFileSync('unmonastery.jsonld').toString());

    var done = this.async();

    var j = 0;
    for(i=0; i < data.length; i++){
      var resource = data[i];
      resource['@context'] = context;
      //console.log(resource);
      db.jsonld.put(resource, function(err, obj){
        if(err) return console.log(err);
        console.log(obj);
        j++;
        if(i === j) done();
      });
    }
  });

  // fetches posts from ghost
  grunt.registerTask('ghost', function(){
    var superagent = require('superagent');
    var concat = require('concat-stream');
    var pickup = require('pickup');
    var async = require('async');
    var _ = require('lodash');
    var feeds = [
      { lang: 'en', url: 'http://en-news.unmonastery.org/rss/' },
      { lang: 'it', url: 'http://it-news.unmonastery.org/rss/' }
    ];

    var lg = require('levelgraph');
    var lgJSONLD = require('levelgraph-jsonld');
    var config = require('./config/daemon');
    var db = lgJSONLD(lg(config.db));

    var done = this.async();

    function ldfize(blog, lang) {
      return _.map(blog.entries, function(post){
        var result = {
          "@context": {
            "@vocab": "http://schema.org/",
            "text": { "@container": "@language" }
          },
          "@type": "BlogPosting",
          "@id": post.link,
          name: post.title,
          text: {},
          dateModified: new Date(post.updated).toISOString()
        };
        result.text[lang] = post.summary;
        return result;
      });
    }

    function fetchFeed(memo, feed, callback){
      superagent.get(feed.url)
        .pipe(pickup())
        .pipe(concat(function(data){
          var blog = JSON.parse(data.toString());
          var posts = ldfize(blog, feed.lang);
          var error = null;
          if(posts.length === 0) error = new Error('empty feed');
          callback(error, _.flatten([memo, posts]));
        }));
    }

    function putPost(item, callback){
      db.jsonld.put(item, function(err, obj){
        if(err)
          callback(err);
        else
          callback();
      });
    }

    function delPost(id, callback){
      db.jsonld.del(id, function(err){
        if(err)
          callback(err);
        else
          callback();
      });
    }

    function updateDb(err, posts){
      if(err) return console.log(err);
      db.search({
        subject: db.v('x'),
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: 'http://schema.org/BlogPosting'
      }, function(err, list){
        console.log('deleting', list);
        var ids = _.map(list, function(item){ return item.x; });
        // delete all posts
        async.each(ids, delPost, function(err){
          if(err) return console.log(err);
          // recreate posts from latest feed
          async.each(posts, putPost, function(err){
            if(err) return console.log(err);
            done();
          });
        });
      });
    }

    async.reduce(feeds, [], fetchFeed, updateDb);

  });
};
