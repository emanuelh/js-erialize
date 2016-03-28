// Gruntfile.js

module.exports = function(grunt) {

  /* CONFIGURE GRUNT */
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Configure jshint to validate js files
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        evil: true
      },
      build: ['Gruntfile.js', 'src/**/*.js']
    },

    // Configure uglify
    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['src/<%= pkg.name %>.js']
        }
      }
    },
    
    // Configure a mochaTest task 
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false,
          clearRequireCache: false
        },
        src: ['test/**/*.js']
      }
    }
  });

  /* LOAD GRUNT PLUGINS */
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-test');
  
  // Alias build
  grunt.registerTask('build', ['jshint:build', 'uglify:build']);
  
  // Alias mochaTest
  grunt.registerTask('test', 'mochaTest:test');

};