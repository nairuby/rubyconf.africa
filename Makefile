## Makefile for Jekyll Setup and Commands

## help: Print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'
	@echo ' '
	@echo 'Please raise an issue on Github if you encounter an issue'

## confirm: Ask for confirmation before running a command
.PHONY: confirm
confirm:
	@echo -n 'Are you sure? [y/N] ' && read ans && [ $${ans:-N} = y ]

## install: Install bundler and jekyll, then install dependencies
install:
.PHONY: install
install:
	gem install bundler jekyll
	bundle config set --local path 'vendor/bundle'
	bundle install
	bundle update

## setup: First time setup; install bundler and jekyll, then serve the site
.PHONY: setup
setup: confirm
	$(MAKE) install
	bundle exec jekyll serve

## sync: Sync Google Sheets data to _data/new_remote
.PHONY: sync
sync:
	ruby _build/google_service_account.rb

## serve: Serve the Jekyll site locally for development
.PHONY: serve
serve:
	bundle exec jekyll serve

## build-js: Build modern JavaScript bundle
.PHONY: build-js
build-js:
	ruby _build/build_modern_js.rb

## build: Build the site for deployment into the public directory
.PHONY: build
build:
	ruby _build/build_modern_js.rb
	bundle exec jekyll build -d public

## clean: Remove vendor and _site directories
.PHONY: clean
clean: confirm
	@rm -rf vendor _site
