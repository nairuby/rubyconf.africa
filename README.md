Setup:

[//]: # ()
[//]: # (```)

[//]: # (git clone https://github.com/nairuby/rubyconf.africa.git)

[//]: # (cd rubyconf.africa)

[//]: # (git checkout Ft/Jekyll-build)

[//]: # (bundle config set --local path 'vendor/bundle')

[//]: # (bundle install)

[//]: # (bundle update)

[//]: # (bundle exec ruby _build/preprocess_assets.rb)

[//]: # (bundle exec jekyll serve # development)

[//]: # (bundle exec jekyll build -d public # deployment)

[//]: # (```)


```
git clone https://github.com/nairuby/rubyconf.africa.git
cd rubyconf.africa
git checkout Ft/Jekyll-build
gem install bundler jekyll
bundle config set --local path 'vendor/bundle'
bundle install
bundle update
bundle exec jekyll serve # development
bundle exec jekyll build -d public # deployment
```

Docker local development: `docker-compose up`
