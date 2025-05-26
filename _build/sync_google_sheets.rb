require 'google/apis/sheets_v4'
require 'googleauth'
require 'yaml'
require 'fileutils'

# Folder to store remote sheet data
DATA_FOLDER = "_data/new_remote"
FileUtils.mkdir_p(DATA_FOLDER)

# Path to your service account JSON file
SERVICE_ACCOUNT_JSON = ENV['SERVICE_ACCOUNT_JSON']
APPLICATION_NAME = ENV['APPLICATION_NAME']
SPREADSHEET_ID = ENV['SPREADSHEET_ID']
SHEET1_FILENAME = ENV['SHEET1_FILENAME']
SHEET1_NAME = ENV['SHEET1_NAME']
SHEET2_FILENAME = ENV['SHEET2_FILENAME']
SHEET2_NAME = ENV['SHEET2_NAME']

# Sheet names and output files
sheets_config = {
  ENV['SHEET1_FILENAME'] => ENV['SHEET1_NAME'],
  ENV['SHEET2_FILENAME'] => ENV['SHEET2_NAME']
}.reject { |key, value| key.nil? || value.nil? }

if sheets_config.empty?
  puts "⚠️ No valid sheets configured. Please set SHEET1_FILENAME and SHEET2_FILENAME in .env"
  exit(1)
end

# Define the scope for Google Sheets API
SCOPE = Google::Apis::SheetsV4::AUTH_SPREADSHEETS_READONLY

# Function to authorize using the service account
def authorize
  unless SERVICE_ACCOUNT_JSON
    puts "❌ SERVICE_ACCOUNT_JSON environment variable not set. Please set it to the path of your service account JSON file."
    exit(1)
  end
  begin
    credentials_hash = JSON.parse(SERVICE_ACCOUNT_JSON)
    Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: StringIO.new(SERVICE_ACCOUNT_JSON),
      scope: SCOPE
    )
  rescue JSON::ParserError => e
    puts "❌ Error parsing SERVICE_ACCOUNT_JSON: #{e.message}"
    exit(1)
  rescue Google::Auth::CredentialsError => e
    puts "❌ Error creating credentials from JSON: #{e.message}"
    exit(1)
  end
end

# Initialize the GOOGLE Sheets API service
sheets_service = Google::Apis::SheetsV4::SheetsService.new
sheets_service.client_options.application_name = APPLICATION_NAME
sheets_service.authorization = authorize

# Fetch and write each sheet
sheets_config.each do |filename, sheet_name|
  puts "📥 Fetching '#{filename}' from sheet '#{sheet_name}'..."

  begin
    response = sheets_service.get_spreadsheet_values(SPREADSHEET_ID, sheet_name)
    values = response.values

    if values.nil? || values.empty?
      puts "⚠️ No data found for '#{filename}'. Skipping..."
      next
    end

    headers = values.shift
    unless headers
      puts "⚠️ Missing headers in sheet '#{sheet_name}'. Skipping..."
      next
    end

    data = values.map do |row|
      # Fill missing cells with nils to match header size
      headers.zip(row + [nil] * (headers.size - row.size)).to_h
    end

    safe_filename = filename.to_s.strip.empty? ? sheet_name.downcase.gsub(/\s+/, '_') : filename
    output_path = File.join(DATA_FOLDER, "#{safe_filename}.yml")
    File.write(output_path, data.to_yaml)
    puts "✅ Saved '#{filename}' to #{output_path}"

  rescue Google::Apis::ClientError => e
    puts "❌ Unexpected error for '#{filename}': #{e.message}"
  rescue StandardError => e
    puts "❌ Unexpected error for '#{filename}': #{e.class} - #{e.message}"
  end
end

puts "🎉 All sheets processed!"
