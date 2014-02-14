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
    develop: {
      daemon: {
        file: 'daemon.js'
      }
    },
    watch: {
      app: {
        files: ['app.js', 'people.html'],
        options: {
          livereload: true
        }
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

  // daemon
  grunt.loadNpmTasks('grunt-develop');

  // common
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('default', ['connect', 'develop', 'watch']);
};
