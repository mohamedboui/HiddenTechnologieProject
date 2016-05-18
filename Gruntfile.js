module.exports = function(grunt) {

  grunt.initConfig({
    nggettext_extract: {
      pot: {
        files: {
          'po/template.pot': ['public/components/**/*.html']
        }
      }
    },
    nggettext_compile: {
      all: {
        files: {
          'public/js/translations.js': ['po/*.po']
        }
      }
    }
  
  });
  grunt.loadNpmTasks('grunt-angular-gettext');
  grunt.registerTask('default', ['nggettext_extract']);
};