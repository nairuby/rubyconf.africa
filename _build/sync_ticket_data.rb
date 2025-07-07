#!/usr/bin/env ruby

require 'google/apis/sheets_v4'
require 'googleauth'
require 'yaml'
require 'json'
require 'fileutils'
require_relative 'google_service_account'

class TicketDataSyncer
  TICKET_DATA_FILE = "_data/tickets.yml"
  SHEET_ID = ENV['TICKET_SHEET_ID']
  SHEET_NAME = ENV['TICKET_SHEET_NAME'] || 'Tickets'
  
  def initialize
    @service = Google::Apis::SheetsV4::SheetsService.new
    @service.client_options.application_name = ENV['APPLICATION_NAME'] || 'RubyConf Ticket System'
    @service.authorization = authorize
  end
  
  def sync_tickets
    unless File.exist?(TICKET_DATA_FILE)
      puts "❌ No ticket data file found at #{TICKET_DATA_FILE}"
      return
    end
    
    unless SHEET_ID
      puts "❌ TICKET_SHEET_ID environment variable not set"
      return
    end
    
    tickets = YAML.load_file(TICKET_DATA_FILE) || []
    
    if tickets.empty?
      puts "📊 No tickets to sync"
      return
    end
    
    puts "📊 Syncing #{tickets.count} tickets to Google Sheets..."
    
    # Prepare data for Google Sheets
    headers = [
      'Ticket ID',
      'Customer Name',
      'Customer Email',
      'Ticket Type',
      'Price',
      'Currency',
      'Payment Method',
      'Payment ID',
      'Purchase Date',
      'Status',
      'Conference Name',
      'Conference Dates',
      'Conference Location'
    ]
    
    rows = tickets.map do |ticket|
      [
        ticket[:id],
        ticket[:customer_name],
        ticket[:customer_email],
        ticket[:ticket_type],
        ticket[:price],
        ticket[:currency],
        ticket[:payment_method],
        ticket[:payment_id],
        ticket[:purchase_date],
        ticket[:status],
        ticket[:conference][:name],
        ticket[:conference][:dates],
        ticket[:conference][:location]
      ]
    end
    
    # Clear existing data and write new data
    clear_sheet
    write_to_sheet([headers] + rows)
    
    puts "✅ Successfully synced #{tickets.count} tickets to Google Sheets"
    
    # Also sync summary statistics
    sync_statistics(tickets)
  end
  
  private
  
  def authorize
    unless ENV['SERVICE_ACCOUNT_JSON']
      puts "❌ SERVICE_ACCOUNT_JSON environment variable not set"
      exit(1)
    end
    
    begin
      Google::Auth::ServiceAccountCredentials.make_creds(
        json_key_io: StringIO.new(ENV['SERVICE_ACCOUNT_JSON']),
        scope: Google::Apis::SheetsV4::AUTH_SPREADSHEETS
      )
    rescue => e
      puts "❌ Error creating Google Sheets credentials: #{e.message}"
      exit(1)
    end
  end
  
  def clear_sheet
    # Clear the sheet first
    range = "#{SHEET_NAME}!A:Z"
    @service.clear_values(SHEET_ID, range)
    puts "🧹 Cleared existing data from #{SHEET_NAME}"
  end
  
  def write_to_sheet(data)
    range = "#{SHEET_NAME}!A1"
    value_range = Google::Apis::SheetsV4::ValueRange.new(values: data)
    
    @service.update_spreadsheet_values(
      SHEET_ID,
      range,
      value_range,
      value_input_option: 'USER_ENTERED'
    )
  end
  
  def sync_statistics(tickets)
    return unless ENV['STATS_SHEET_NAME']
    
    stats_sheet = ENV['STATS_SHEET_NAME']
    
    # Calculate statistics
    total_tickets = tickets.count
    total_revenue = tickets.sum { |t| t[:price].to_f }
    by_type = tickets.group_by { |t| t[:ticket_type] }.transform_values(&:count)
    by_payment = tickets.group_by { |t| t[:payment_method] }.transform_values(&:count)
    
    # Prepare statistics data
    stats_data = [
      ['Metric', 'Value'],
      ['Total Tickets', total_tickets],
      ['Total Revenue', "#{tickets.first[:currency] || 'KSH'} #{total_revenue}"],
      ['Last Updated', Time.now.strftime('%Y-%m-%d %H:%M:%S')],
      ['', ''],
      ['By Ticket Type', ''],
    ]
    
    by_type.each do |type, count|
      stats_data << [type, count]
    end
    
    stats_data << ['', '']
    stats_data << ['By Payment Method', '']
    
    by_payment.each do |method, count|
      stats_data << [method, count]
    end
    
    # Clear and write statistics
    range = "#{stats_sheet}!A:Z"
    @service.clear_values(SHEET_ID, range)
    
    range = "#{stats_sheet}!A1"
    value_range = Google::Apis::SheetsV4::ValueRange.new(values: stats_data)
    
    @service.update_spreadsheet_values(
      SHEET_ID,
      range,
      value_range,
      value_input_option: 'USER_ENTERED'
    )
    
    puts "📈 Statistics synced to #{stats_sheet}"
  end
end

# Run the sync if this file is executed directly
if __FILE__ == $0
  puts "🔄 Starting ticket data sync to Google Sheets..."
  
  begin
    syncer = TicketDataSyncer.new
    syncer.sync_tickets
  rescue => e
    puts "❌ Error syncing ticket data: #{e.message}"
    puts e.backtrace
    exit(1)
  end
  
  puts "🎉 Ticket data sync completed!"
end 