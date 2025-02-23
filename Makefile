# Makefile for Jekyll Setup and Commands

.PHONY: install serve build clean assets

# Install bundler and jekyll
install:
	gem install bundler jekyll
	bundle config set --local path 'vendor/bundle'
	bundle install
	bundle update

# First time setup: install bundler and jekyll, then serve the site
setup:
	gem install bundler jekyll
	bundle config set --local path 'vendor/bundle'
	bundle install
	bundle update
	bundle exec jekyll serve

# Serve the Jekyll site locally for development
serve:
	bundle exec jekyll serve

# Build the site for deployment
build: assets
	bundle exec jekyll build -d public

# Clean the vendor directory
clean:
	rm -rf vendor _site

# Assets
assets:
	ruby _build/preprocess_assets.rb