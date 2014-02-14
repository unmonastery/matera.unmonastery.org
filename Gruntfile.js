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
    handlebars: {
      compile: {
        options: {
          namespace: 'JST',
          processName: function(filePath){ return filePath.split('/')[1].replace('.hbs', ''); }
        },
        files: {
          'templates.js': 'templates/*.hbs'
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
        files: ['app.js', 'templates.js', 'people.html'],
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
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  // daemon
  grunt.loadNpmTasks('grunt-develop');

  // common
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('default', ['connect', 'handlebars', 'develop', 'watch']);
};
