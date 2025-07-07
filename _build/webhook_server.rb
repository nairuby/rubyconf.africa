#!/usr/bin/env ruby

require 'sinatra'
require 'json'
require 'net/http'
require 'uri'
require 'openssl'
require_relative 'ticket_system'

# Configure Sinatra since we're not using Rails
set :port, ENV['WEBHOOK_PORT'] || 4567
set :bind, '0.0.0.0'
set :logging, true

# Initialize ticket system
ticket_system = TicketSystem.new

# Health check endpoint
get '/health' do
  content_type :json
  { status: 'ok', timestamp: Time.now.to_i }.to_json
end

# PayPal IPN (Instant Payment Notification) webhook
post '/webhooks/paypal' do
  content_type :json
  
  begin
    # Get the raw POST data
    raw_post_data = request.body.read
    
    # Parse the PayPal IPN data
    parsed_data = {}
    raw_post_data.split('&').each do |pair|
      key, value = pair.split('=', 2)
      parsed_data[URI.decode_www_form_component(key)] = URI.decode_www_form_component(value) if value
    end
    
    # Verify the PayPal IPN (recommended for production)
    if ENV['PAYPAL_VERIFY_IPN'] == 'true'
      verified = verify_paypal_ipn(raw_post_data)
      unless verified
        puts "❌ PayPal IPN verification failed"
        return { error: "IPN verification failed" }.to_json
      end
    end
    
    # Check if payment is completed
    if parsed_data['payment_status'] == 'Completed'
      # Extract customer information
      customer_info = {
        name: "#{parsed_data['first_name']} #{parsed_data['last_name']}",
        email: parsed_data['payer_email']
      }
      
      # Determine ticket type based on amount
      amount = parsed_data['mc_gross'].to_f
      ticket_type = determine_ticket_type_from_amount(amount)
      
      # Payment information
      payment_info = {
        amount: amount,
        currency: parsed_data['mc_currency'],
        method: 'PayPal',
        id: parsed_data['txn_id']
      }
      
      # Generate and send ticket
      ticket_data = ticket_system.generate_ticket(customer_info, ticket_type, payment_info)
      
      puts "✅ PayPal ticket generated: #{ticket_data[:id]}"
      
      { 
        status: 'success', 
        ticket_id: ticket_data[:id],
        message: 'Ticket generated and sent successfully' 
      }.to_json
    else
      puts "⚠️ PayPal payment not completed. Status: #{parsed_data['payment_status']}"
      { status: 'ignored', message: 'Payment not completed' }.to_json
    end
    
  rescue => e
    puts "❌ PayPal webhook error: #{e.message}"
    puts e.backtrace
    status 500
    { error: 'Internal server error' }.to_json
  end
end

# MPESA webhook
post '/webhooks/mpesa' do
  content_type :json
  
  begin
    request_payload = JSON.parse(request.body.read)
    
    puts "📥 MPESA webhook received: #{request_payload}"
    
    # Check if payment is successful
    if request_payload['status'] == 'success' || request_payload['ResultCode'] == '0'
      # Extract customer information
      customer_info = {
        name: request_payload['customer_name'] || request_payload['FirstName'] || 'MPESA Customer',
        email: request_payload['customer_email'] || request_payload['email'] || 'no-email@provided.com'
      }
      
      # Determine ticket type based on amount
      amount = (request_payload['amount'] || request_payload['Amount']).to_f
      ticket_type = determine_ticket_type_from_amount(amount)
      
      # Payment information
      payment_info = {
        amount: amount,
        currency: 'KSH',
        method: 'MPESA',
        id: request_payload['transaction_id'] || request_payload['TransactionID'] || request_payload['CheckoutRequestID']
      }
      
      # Generate and send ticket
      ticket_data = ticket_system.generate_ticket(customer_info, ticket_type, payment_info)
      
      puts "✅ MPESA ticket generated: #{ticket_data[:id]}"
      
      { 
        status: 'success', 
        ticket_id: ticket_data[:id],
        message: 'Ticket generated and sent successfully' 
      }.to_json
    else
      puts "⚠️ MPESA payment not successful. Status: #{request_payload['status']}"
      { status: 'ignored', message: 'Payment not successful' }.to_json
    end
    
  rescue JSON::ParserError => e
    puts "❌ Invalid JSON in MPESA webhook: #{e.message}"
    status 400
    { error: 'Invalid JSON payload' }.to_json
  rescue => e
    puts "❌ MPESA webhook error: #{e.message}"
    puts e.backtrace
    status 500
    { error: 'Internal server error' }.to_json
  end
end

# Test webhook endpoint
post '/webhooks/test' do
  content_type :json
  
  begin
    request_payload = JSON.parse(request.body.read)
    
    puts "🧪 Test webhook received: #{request_payload}"
    
    customer_info = {
      name: request_payload['customer_name'] || 'Test Customer',
      email: request_payload['customer_email'] || 'test@example.com'
    }
    
    ticket_type = request_payload['ticket_type'] || 'Full Pass'
    payment_info = {
      amount: request_payload['amount'] || 3500,
      currency: request_payload['currency'] || 'KSH',
      method: request_payload['method'] || 'Test',
      id: request_payload['payment_id'] || "TEST#{Time.now.to_i}"
    }
    
    ticket_data = ticket_system.generate_ticket(customer_info, ticket_type, payment_info)
    
    puts "✅ Test ticket generated: #{ticket_data[:id]}"
    
    { 
      status: 'success', 
      ticket_id: ticket_data[:id],
      message: 'Test ticket generated and sent successfully' 
    }.to_json
    
  rescue JSON::ParserError => e
    puts "❌ Invalid JSON in test webhook: #{e.message}"
    status 400
    { error: 'Invalid JSON payload' }.to_json
  rescue => e
    puts "❌ Test webhook error: #{e.message}"
    puts e.backtrace
    status 500
    { error: 'Internal server error' }.to_json
  end
end

# Admin endpoints
get '/admin/stats' do
  content_type :json
  
  if ENV['ADMIN_USERNAME'] && ENV['ADMIN_PASSWORD']
    auth = Rack::Auth::Basic::Request.new(request.env)
    unless auth.provided? && auth.basic? && auth.credentials == [ENV['ADMIN_USERNAME'], ENV['ADMIN_PASSWORD']]
      headers['WWW-Authenticate'] = 'Basic realm="Admin Area"'
      halt 401, "Unauthorized"
    end
  end
  
  ticket_system.get_ticket_stats.to_json
end

get '/admin/tickets' do
  content_type :json
  
  if ENV['ADMIN_USERNAME'] && ENV['ADMIN_PASSWORD']
    auth = Rack::Auth::Basic::Request.new(request.env)
    unless auth.provided? && auth.basic? && auth.credentials == [ENV['ADMIN_USERNAME'], ENV['ADMIN_PASSWORD']]
      headers['WWW-Authenticate'] = 'Basic realm="Admin Area"'
      halt 401, "Unauthorized"
    end
  end
  
  ticket_system.get_all_tickets.to_json
end

# Helper methods
def verify_paypal_ipn(raw_post_data)
  uri = URI.parse("https://#{ENV['PAYPAL_SANDBOX'] == 'true' ? 'ipnpb.sandbox' : 'ipnpb'}.paypal.com/cgi-bin/webscr")
  
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  http.verify_mode = OpenSSL::SSL::VERIFY_PEER
  
  request = Net::HTTP::Post.new(uri.path)
  request.body = "cmd=_notify-validate&#{raw_post_data}"
  request['Content-Type'] = 'application/x-www-form-urlencoded'
  request['Content-Length'] = request.body.length.to_s
  
  response = http.request(request)
  
  response.body == "VERIFIED"
end

def determine_ticket_type_from_amount(amount)
  case amount
  when 3500
    "Full Pass"
  when 1500
    "Normal Pass"
  when 14850
    "Group Pass"
  else
    "Unknown (#{amount})"
  end
end

if __FILE__ == $0
  puts "🚀 Webhook server starting on port #{settings.port}"
  puts "📡 Endpoints available:"
  puts "   POST /webhooks/paypal - PayPal IPN webhook"
  puts "   POST /webhooks/mpesa - MPESA webhook"
  puts "   POST /webhooks/test - Test webhook"
  puts "   GET /admin/stats - Admin statistics"
  puts "   GET /admin/tickets - Admin ticket list"
  puts "   GET /health - Health check"
  puts ""
  puts "💡 Set environment variables for email and authentication:"
  puts "   SMTP_USERNAME, SMTP_PASSWORD for email delivery"
  puts "   ADMIN_USERNAME, ADMIN_PASSWORD for admin access"
  puts "   PAYPAL_VERIFY_IPN=true for PayPal IPN verification"
  puts "   PAYPAL_SANDBOX=true for PayPal sandbox mode"
  
  run!
end 