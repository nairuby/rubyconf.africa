require 'sprockets'
require 'fileutils'
require 'sassc'
require 'uglifier'

# Get relevant paths
project_root = File.expand_path('..', File.dirname(__FILE__))
app_css_file = File.join(project_root, 'assets', 'css', 'application.css')
app_js_file  = File.join(project_root, 'assets', 'js', 'application.js')

# Initialize Sprockets
environment = Sprockets::Environment.new

# Add asset paths
environment.append_path(File.join(project_root, '_assets', 'javascripts'))
environment.append_path(File.join(project_root, '_assets', 'stylesheets'))

# Set compression options
environment.js_compressor  = Uglifier.new(harmony: true)
environment.css_compressor = :sassc

# Create directories if they don't exist
FileUtils.mkdir_p File.dirname(app_css_file)
FileUtils.mkdir_p File.dirname(app_js_file)

# Process and write CSS
puts "Processing CSS..."
begin
  css_content = environment['application.css'].to_s
  File.open(app_css_file, 'w') { |f| f.write(css_content) }
  puts "CSS bundled successfully to #{app_css_file}"
rescue => e
  puts "Error processing CSS: #{e.message}"
end

# Process and write JavaScript
puts "Processing JavaScript..."
begin
  js_content = environment['application.js'].to_s
  File.open(app_js_file, 'w') { |f| f.write(js_content) }
  puts "JavaScript bundled successfully to #{app_js_file}"
rescue => e
  puts "Error processing JavaScript: #{e.message}"
end