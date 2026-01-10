[![Deploy site](https://github.com/nairuby/rubyconf.africa/actions/workflows/deploy.yml/badge.svg)](https://github.com/nairuby/rubyconf.africa/actions/workflows/deploy.yml)

# RubyConf Africa

## Setup




To set up the project for the first time, follow these steps:

```bash
git clone https://github.com/nairuby/rubyconf.africa.git
cd rubyconf.africa
```

## NOTE
This project requires a service account configuration and environment variables to run.
Obtain a service account JSON key from the admin.
Store it securely on your machine.
Set environment variables

## Set Up Tailwind
```bash
npm install -g pnpm
pnpm install
pnpm dev
```

```
git checkout Ft/Conf-details
make setup
```

This will install the necessary dependencies and start the Jekyll server for development.

## Update Instructions

If you need to update the project, you can follow these instructions:

1. **Pull the latest changes:**

   ```bash
   git pull origin main
   ```

2. **Update your local dependencies:**

   ```bash
   make install
   ```

3. **Start the server:**
   ```bash
   make serve
   ```

### Commands Overview

- **First Time Setup:**  
  Run `make setup` to install dependencies and start the Jekyll server.

- **Install Dependencies:**  
  Run `make install` to install or update the project's dependencies.

- **Sync Google Sheets:**
  Run `make sync` to run a Google sheets sync script

- **Serve the Site:**  
  Run `make serve` to start the Jekyll server for local development.

- **Clean Up:**  
  Run `make clean` to remove the vendor directory and the `_serve` folder.

## Troubleshooting

### Gem Installation Issues

If you encounter errors with the following gems during setup or installation:

- `dotenv` (~> 3.1)
- `googleauth` (~> 1.14)
- `google-api-client` (~> 0.53.0)
- `google-apis-sheets_v4` (~> 0.41)

You can install them manually using these commands:

```bash
gem install dotenv
gem install googleauth
gem install google-api-client
gem install google-apis-sheets_v4
```

After installing the gems manually, try running `make install` or `make setup` again.

## Deployment

To build the site for deployment, you can run:

```bash
bundle exec jekyll build -d public
```
