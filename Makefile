# Makefile for Jekyll Setup and Commands

.PHONY: install serve build clean

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

# Sync Google Sheets data to _data/new_remote
sync:
	ruby _build/sync_google_sheets.rb

# Serve the Jekyll site locally for development
serve:
	bundle exec jekyll serve

# Build the site for deployment
build:
	bundle exec jekyll build -d public

# Clean the vendor directory
clean:
	rm -rf vendor _site
