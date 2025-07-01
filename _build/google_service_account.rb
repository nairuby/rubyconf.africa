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

# GDrive image link parser
def convert_gdrive_url(url)
  return nil unless url
  match = url.match(%r{https://drive\.google\.com/file/d/(.+)/view})
  return nil unless match
  "https://lh3.googleusercontent.com/d/#{match[1]}=w1000?authuser=1/view"
end

# Initialize google sheet API
service = Google::Apis::SheetsV4::SheetsService.new
service.authorization = authorize_google_sheets(CREDENTIALS_PATH, SERVICE_ACCOUNT_JSON)

SHEETS.each do |sheet|
  response = service.get_spreadsheet_values(SPREADSHEET_ID, sheet)

  # Convert to JSON
  values = response.values
  headers = values.first
  data = values[1..-1].map { |row| headers.zip(row).to_h }

  data.each do |item|
    item["image"] = convert_gdrive_url(item["image"]) if item["image"]
  end

  # Schedule tab
  if sheet.downcase == "schedule"
    schedule = {}

    data.group_by { |row| row["day"] }.each do |day_key, entries|
      next if day_key.nil? || day_key.strip.empty?

      day_date = entries.first["date"]
      events = entries.map do |entry|
        event = {
          "time" => {
            "start" => entry["start_time"],
            "end" => entry["end_time"]
          },
          "topic" => entry["topic"]
        }
        event["description"] = entry["description"] unless entry["description"].nil? || entry["description"].to_s.strip.empty?
        event["speaker"] = entry["speaker"] unless entry["speaker"].nil? || entry["speaker"].empty?
        event["image"] = convert_gdrive_url(entry["image"]) if entry["image"]
      end

      schedule[day_key] = {
        "date" => day_date,
        "events" => events
      }
    end
  end

  # Save data to a json data file
  File.write("#{DATA_FOLDER}/#{sheet}.json", JSON.pretty_generate(data))
end
