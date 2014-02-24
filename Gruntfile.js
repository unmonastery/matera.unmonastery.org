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
    var db = lgJSONLD(lg('dev.ldb'));

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
};
