require "google/apis/sheets_v4"
require "googleauth"
require "json"
require "fileutils"
require "dotenv"

Dotenv.load if File.exist?('.env')

# Folder to store remote sheet data
DATA_FOLDER = "_data/new_remote"
FileUtils.mkdir_p(DATA_FOLDER)

# Path to your service account JSON file
CREDENTIALS_PATH = ENV['CREDENTIALS_PATH'] || "./service_acc.json"
SERVICE_ACCOUNT_JSON = ENV["SERVICE_ACCOUNT_JSON"]
APPLICATION_NAME = ENV["APPLICATION_NAME"] || "GoogleSheetsSync"
SPREADSHEET_ID = ENV["SPREADSHEET_ID"]
SHEETS = eval(ENV["SHEETS"])
SCOPE = ["https://www.googleapis.com/auth/spreadsheets"]

# Authorize with service account
def authorize_google_sheets(path, json_string)
  cred_io = if json_string && !json_string.empty?
              StringIO.new(json_string)
            elsif path && File.exist?(path)
              File.open(path)
            else
              abort "No valid credentials provided"
            end
  Google::Auth::ServiceAccountCredentials.make_creds(
    json_key_io: cred_io,
    scope: SCOPE
  ).tap(&:fetch_access_token!)
end

# Convert single or multiple Drive URLs to lh3 format
def convert_gdrive_url(url)
  return [] unless url

  urls = url.split(/\s*,\s*/)
  converted_urls = urls.map do |u|
    if u =~ %r{drive\.google\.com/file/d/([^/]+)}
      "https://lh3.googleusercontent.com/d/#{$1}=w1000?authuser=1/view"
    else
      nil
    end
  end.compact

  converted_urls # always return an array (even if length 0 or 1)
end


# Initialize Sheets API
service = Google::Apis::SheetsV4::SheetsService.new
service.authorization = authorize_google_sheets(CREDENTIALS_PATH, SERVICE_ACCOUNT_JSON)

SHEETS.each do |sheet|
  response = service.get_spreadsheet_values(SPREADSHEET_ID, sheet)

  values = response.values
  headers = values.first
  data = values[1..-1].map { |row| headers.zip(row).to_h }

  # Process images for every sheet (flat structure)
  data.each do |item|
    item["image"] = convert_gdrive_url(item["image"]) if item["image"]
  end

  # Save as flat JSON array
  File.write("#{DATA_FOLDER}/#{sheet}.json", JSON.pretty_generate(data))
end
