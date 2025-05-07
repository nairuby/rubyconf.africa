def load_env_if_available
  begin
    require 'dotenv'
    Dotenv.load if File.exist?('.env')
    puts "🔍 Loaded env vars from .env:"
  rescue LoadError
    puts "📦 Dotenv not available (likely running in CI)"
  end
end
