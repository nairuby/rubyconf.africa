# Not in use

require 'sprockets'
require 'fileutils'
# require 'uglifier'

# Get relevant paths
project_root = File.expand_path('..', File.dirname(__FILE__))
app_css_file = File.join(project_root, 'assets', 'stylesheets', 'application.css')
# app_js_file  = File.join(project_root, 'assets', 'javascripts', 'application.js')

# Initialize Sprockets
environment = Sprockets::Environment.new
# environment.append_path(File.join(project_root, '_assets', 'javascripts'))
environment.append_path(File.join(project_root, '_assets', 'stylesheets'))

# Set configuration
# environment.js_compressor  = Uglifier.new(harmony: true)
environment.css_compressor = :sass

# Create directories if they do not exist
# FileUtils.mkdir_p project_root+'/assets/javascripts'
FileUtils.mkdir_p project_root+'/assets/stylesheets'

# Write minifies JS & CSS into files
File.open(app_css_file, 'w') { |f| f.write environment['application.css'].to_s }
# File.open(app_js_file,  'w') { |f| f.write environment['application.js'].to_s }

# See; http://kingori.co/minutae/2014/04/minify-assets-github-pages/
