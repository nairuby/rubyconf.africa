#!/usr/bin/env ruby

require 'dotenv'
require 'fileutils'

# Load environment variables from .env file
Dotenv.load('.env')

class TicketSystemManager
  def initialize
    @build_dir = File.dirname(__FILE__)
    @root_dir = File.dirname(@build_dir)
  end
  
  def start
    puts "🎫 RubyConf Ticket System Manager"
    puts "=================================="
    puts ""
    
    check_prerequisites
    
    if ARGV.empty?
      show_usage
      return
    end
    
    case ARGV[0]
    when 'server'
      start_webhook_server
    when 'sync'
      sync_ticket_data
    when 'test'
      test_ticket_generation
    when 'stats'
      show_statistics
    when 'setup'
      setup_system
    else
      puts "❌ Unknown command: #{ARGV[0]}"
      show_usage
    end
  end
  
  private
  
  def check_prerequisites
    missing_gems = []
    
    %w[sinatra prawn mail rqrcode].each do |gem_name|
      begin
        require gem_name
      rescue LoadError
        missing_gems << gem_name
      end
    end
    
    if missing_gems.any?
      puts "❌ Missing required gems: #{missing_gems.join(', ')}"
      puts "💡 Run: bundle install"
      exit(1)
    end
  end
  
  def show_usage
    puts "Usage: ruby start_ticket_system.rb [command]"
    puts ""
    puts "Commands:"
    puts "  server  - Start the webhook server"
    puts "  sync    - Sync ticket data to Google Sheets"
    puts "  test    - Test ticket generation"
    puts "  stats   - Show ticket statistics"
    puts "  setup   - Setup the ticket system"
    puts ""
    puts "Examples:"
    puts "  ruby start_ticket_system.rb server"
    puts "  ruby start_ticket_system.rb sync"
    puts "  ruby start_ticket_system.rb test"
  end
  
  def start_webhook_server
    puts "🚀 Starting webhook server..."
    
    unless File.exist?('.env')
      puts "⚠️  No .env file found. Copy _build/config_template.env to .env and configure it."
      return
    end
    
    server_file = File.join(@build_dir, 'webhook_server.rb')
    
    if File.exist?(server_file)
      puts "📡 Webhook server starting on port #{ENV['WEBHOOK_PORT'] || 4567}"
      system("ruby #{server_file}")
    else
      puts "❌ Webhook server file not found: #{server_file}"
    end
  end
  
  def sync_ticket_data
    puts "🔄 Syncing ticket data to Google Sheets..."
    
    sync_file = File.join(@build_dir, 'sync_ticket_data.rb')
    
    if File.exist?(sync_file)
      system("ruby #{sync_file}")
    else
      puts "❌ Sync script not found: #{sync_file}"
    end
  end
  
  def test_ticket_generation
    puts "🧪 Testing ticket generation..."
    
    require_relative 'ticket_system'
    
    begin
      ticket_system = TicketSystem.new
      
      customer_info = {
        name: 'Test Customer',
        email: 'test@example.com'
      }
      
      payment_info = {
        amount: 3500,
        currency: 'KSH',
        method: 'Test',
        id: "TEST#{Time.now.to_i}"
      }
      
      ticket_data = ticket_system.generate_ticket(customer_info, 'Full Pass', payment_info)
      
      puts "✅ Test ticket generated successfully!"
      puts "   Ticket ID: #{ticket_data[:id]}"
      puts "   Customer: #{ticket_data[:customer_name]}"
      puts "   Email: #{ticket_data[:customer_email]}"
      puts "   Type: #{ticket_data[:ticket_type]}"
      puts "   Price: #{ticket_data[:currency]} #{ticket_data[:price]}"
      
    rescue => e
      puts "❌ Error generating test ticket: #{e.message}"
      puts e.backtrace
    end
  end
  
  def show_statistics
    puts "📊 Ticket Statistics"
    puts "===================="
    
    require_relative 'ticket_system'
    
    begin
      ticket_system = TicketSystem.new
      stats = ticket_system.get_ticket_stats
      
      puts "Total Tickets: #{stats[:total_tickets]}"
      puts "Total Revenue: KSH #{stats[:total_revenue]}"
      puts ""
      puts "By Ticket Type:"
      stats[:by_type].each do |type, count|
        puts "  #{type}: #{count}"
      end
      puts ""
      puts "By Payment Method:"
      stats[:by_payment_method].each do |method, count|
        puts "  #{method}: #{count}"
      end
      
    rescue => e
      puts "❌ Error getting statistics: #{e.message}"
    end
  end
  
  def setup_system
    puts "🔧 Setting up ticket system..."
    
    # Create necessary directories
    %w[_data tickets].each do |dir|
      unless File.directory?(dir)
        FileUtils.mkdir_p(dir)
        puts "✅ Created directory: #{dir}"
      end
    end
    
    # Copy configuration template
    config_template = File.join(@build_dir, 'config_template.env')
    env_file = '.env'
    
    if File.exist?(config_template) && !File.exist?(env_file)
      FileUtils.cp(config_template, env_file)
      puts "✅ Created .env file from template"
      puts "💡 Please edit .env with your actual configuration values"
    elsif File.exist?(env_file)
      puts "⚠️  .env file already exists"
    else
      puts "❌ Configuration template not found"
    end
    
    puts ""
    puts "🎉 Setup complete! Next steps:"
    puts "1. Configure your .env file with actual values"
    puts "2. Run 'bundle install' to install gems"
    puts "3. Test with: ruby start_ticket_system.rb test"
    puts "4. Start server with: ruby start_ticket_system.rb server"
  end
end

# Run the manager
if __FILE__ == $0
  manager = TicketSystemManager.new
  manager.start
end 