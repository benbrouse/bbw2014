module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
 
   concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['www/js/**/*.js'],
        dest: 'www/dist/<%= pkg.name %>.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },

    uglify: {
       options: {
          // the banner is inserted at the top of the output
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
       },
       dist: {
         files: {
             'www/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
         }
       }
    },
    jshint: {
      src: ['Gruntfile.js', 'www/js/**/*.js'],
      options: {
        curly: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        unused: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        strict: false,
        globalstrict: true,
        globals: {
          module: true,
          google: true,
          _: true,
          angular: true
        }
      }  
    }, 
    watch: {
      files: ['<%= jshint.src %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};