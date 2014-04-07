module.exports = function(grunt) {
    grunt.initConfig(
        {
            jasmine: {
                dev: {
                    src: ['src/**/*.js', 'lib/**/*.js'],
                    options: {
                        specs: 'specs/**/*.spec.js',
                        keepRunner: true
                    }
                }
            },
            watch: {
                js: {
                    files: ['specs/**/*.js', 'src/**/*.js'],
                    tasks: ['jslint', 'jasmine']
                },
            },

            jslint: {
                default: {
                    src: [
                        'specs/**/*.js',
                        'src/**/*.js'
                    ]
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jslint');

    grunt.registerTask('default', ['jasmine']);
};