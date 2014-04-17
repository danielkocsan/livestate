module.exports = function(grunt) {
    grunt.initConfig(
        {
            jasmine: {
                dev: {
                    src: ['lib/di.js', 'src/**/*.js', 'lib/**/*.js'],
                    options: {
                        specs: 'specs/**/*.spec.js',
                        keepRunner: true
                    }
                }
            },
            watch: {
                js: {
                    files: ['specs/**/*.js', 'src/**/*.js'],
                    tasks: ['jshint', 'jasmine']
                }
            },

            jshint: {
                all: [
                    'specs/**/*.js',
                    'src/**/*.js'
                ],
                options: {
                    jshintrc: '.jshintrc'
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'jasmine']);
};