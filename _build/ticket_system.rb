#!/usr/bin/env ruby

require 'prawn'
require 'prawn-qr'
require 'mail'
require 'rqrcode'
require 'securerandom'
require 'yaml'
require 'json'
require 'fileutils'
require 'date'
require_relative 'google_service_account'

class TicketSystem
  DATA_FOLDER = "_data"
  TICKETS_FOLDER = "tickets"
  TICKET_DATA_FILE = "#{DATA_FOLDER}/tickets.yml"
  
  def initialize
    setup_folders
    setup_email
    load_tickets_data
  end
  
  private
  
  def setup_folders
    FileUtils.mkdir_p(DATA_FOLDER)
    FileUtils.mkdir_p(TICKETS_FOLDER)
  end
  
  def setup_email
    #TODO:Email configuration - we need to set these environment variables using organisers@rubyconf.africa mail server
    Mail.defaults do
      delivery_method :smtp, {
        address: ENV['SMTP_ADDRESS'] || 'smtp.gmail.com',
        port: ENV['SMTP_PORT'] || 587,
        user_name: ENV['SMTP_USERNAME'],
        password: ENV['SMTP_PASSWORD'],
        authentication: 'plain',
        enable_starttls_auto: true
      }
    end
  end
  
  def load_tickets_data
    @tickets_data = if File.exist?(TICKET_DATA_FILE)
      YAML.load_file(TICKET_DATA_FILE) || []
    else
      []
    end
  end
  
  def save_tickets_data
    File.write(TICKET_DATA_FILE, @tickets_data.to_yaml)
  end
  
  public
  
  def generate_ticket(customer_info, ticket_type, payment_info)
    ticket_id = SecureRandom.hex(8).upcase
    ticket_data = {
      id: ticket_id,
      customer_name: customer_info[:name],
      customer_email: customer_info[:email],
      ticket_type: ticket_type,
      price: payment_info[:amount],
      currency: payment_info[:currency],
      payment_method: payment_info[:method],
      payment_id: payment_info[:id],
      purchase_date: Date.today.to_s,
      conference: {
        name: "Ruby Conf Africa 2025",
        dates: "18th - 19th July, 2025",
        location: "Nairobi, Kenya"
      },
      status: "confirmed"
    }
    
    # Save ticket data
    @tickets_data << ticket_data
    save_tickets_data
    
    # Generate PDF
    pdf_path = generate_pdf_ticket(ticket_data)
    
    # Send email
    send_ticket_email(ticket_data, pdf_path)
    
    # Update Google Sheets (Judah to help me with this)
    update_google_sheets(ticket_data)
    
    ticket_data
  end
  
  private
  
  def generate_pdf_ticket(ticket_data)
    pdf_filename = "#{TICKETS_FOLDER}/ticket_#{ticket_data[:id]}.pdf"
    
    Prawn::Document.generate(pdf_filename) do |pdf|
      # Header with logo and title
      pdf.font_size 24
      pdf.text "Ruby Conf Africa 2025", style: :bold, align: :center, color: "DC143C"
      pdf.move_down 10
      
      pdf.font_size 16
      pdf.text "#{ticket_data[:conference][:dates]}", align: :center, color: "666666"
      pdf.text "#{ticket_data[:conference][:location]}", align: :center, color: "666666"
      pdf.move_down 30
      
      # Ticket details
      pdf.font_size 14
      pdf.text "TICKET CONFIRMATION", style: :bold
      pdf.move_down 10
      
      # Customer info
      pdf.text "Name: #{ticket_data[:customer_name]}", style: :bold
      pdf.text "Email: #{ticket_data[:customer_email]}"
      pdf.text "Ticket Type: #{ticket_data[:ticket_type]}"
      pdf.text "Price: #{ticket_data[:currency]} #{ticket_data[:price]}"
      pdf.text "Ticket ID: #{ticket_data[:id]}", style: :bold
      pdf.text "Purchase Date: #{ticket_data[:purchase_date]}"
      pdf.move_down 20
      
      # QR Code for ticket verification
      qr_code = RQRCode::QRCode.new(ticket_data[:id])
      qr_code_png = qr_code.as_png(size: 200)
      
      qr_temp_file = "#{TICKETS_FOLDER}/qr_#{ticket_data[:id]}.png"
      File.write(qr_temp_file, qr_code_png.to_s, mode: 'wb')
      
      # Embed QR code to PDF
      pdf.text "Verification Code:", style: :bold
      pdf.move_down 10
      begin
        pdf.image qr_temp_file, width: 100, height: 100
      rescue => e
        puts "Warning: Could not add QR code to PDF: #{e.message}"
        pdf.text "QR Code: #{ticket_data[:id]}", style: :bold
      end
      
      pdf.move_down 20
      
      pdf.font_size 12
      pdf.text "Important Information:", style: :bold
      pdf.move_down 5
      pdf.text "• Please bring this ticket (printed or digital) to the conference"
      pdf.text "• Present your ticket at registration for check-in"
      pdf.text "• For questions, contact: organisers@rubyconf.africa"
      pdf.move_down 20
      
      # Footer
      pdf.text "Thank you for joining Ruby Conf Africa 2025!", align: :center, style: :bold
      pdf.text "We look forward to seeing you there!", align: :center
      
      # Clean up temporary QR code file
      File.delete(qr_temp_file) if File.exist?(qr_temp_file)
    end
    
    pdf_filename
  end
  
  def send_ticket_email(ticket_data, pdf_path)
    unless ENV['SMTP_USERNAME'] && ENV['SMTP_PASSWORD']
      puts "Warning: Email not configured. Skipping email delivery."
      return
    end
    
    mail = Mail.new do
      from     ENV['SMTP_USERNAME']
      to       ticket_data[:customer_email]
      subject  "Your Ruby Conf Africa 2025 Ticket - #{ticket_data[:id]}"
      
      html_part do
        content_type 'text/html; charset=UTF-8'
        body generate_email_html(ticket_data)
      end
      
      add_file pdf_path
    end
    
    begin
      mail.deliver!
      puts "✅ Ticket email sent to #{ticket_data[:customer_email]}"
    rescue => e
      puts "❌ Failed to send email: #{e.message}"
    end
  end
  
  def generate_email_html(ticket_data)
    <<~HTML
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #DC143C; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .ticket-info { background-color: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { background-color: #333; color: white; padding: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Ruby Conf Africa 2025</h1>
            <p>#{ticket_data[:conference][:dates]} | #{ticket_data[:conference][:location]}</p>
          </div>
          
          <div class="content">
            <h2>Hi #{ticket_data[:customer_name]},</h2>
            <p>Thank you for purchasing your ticket to Ruby Conf Africa 2025! We're excited to have you join us.</p>
            
            <div class="ticket-info">
              <h3>Ticket Details:</h3>
              <p><strong>Ticket ID:</strong> #{ticket_data[:id]}</p>
              <p><strong>Ticket Type:</strong> #{ticket_data[:ticket_type]}</p>
              <p><strong>Price:</strong> #{ticket_data[:currency]} #{ticket_data[:price]}</p>
              <p><strong>Purchase Date:</strong> #{ticket_data[:purchase_date]}</p>
            </div>
            
            <h3>Important Information:</h3>
            <ul>
              <li>Your ticket PDF is attached to this email</li>
              <li>Please bring your ticket (printed or digital) to the conference</li>
              <li>Present your ticket at registration for check-in</li>
              <li>The conference runs from #{ticket_data[:conference][:dates]} in #{ticket_data[:conference][:location]}</li>
            </ul>
            
            <p>If you have any questions, please contact us at <a href="mailto:organisers@rubyconf.africa">organisers@rubyconf.africa</a></p>
            
            <p>Looking forward to seeing you at the conference!</p>
            <p>The Ruby Conf Africa Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Ruby Conf Africa. All rights reserved.</p>
          </div>
        </body>
      </html>
    HTML
  end
  
  def update_google_sheets(ticket_data)
    # We could integrate with our existing Google Sheets setup
    # OR we can modify our sync_google_sheets.rb to also write ticket data (Lmk)
    puts "📊 Ticket data ready for Google Sheets integration"
  end
  
  def find_ticket(ticket_id)
    @tickets_data.find { |ticket| ticket[:id] == ticket_id }
  end
  
  def get_all_tickets
    @tickets_data
  end
  
  def get_ticket_stats
    {
      total_tickets: @tickets_data.count,
      total_revenue: @tickets_data.sum { |t| t[:price].to_f },
      by_type: @tickets_data.group_by { |t| t[:ticket_type] }.transform_values(&:count),
      by_payment_method: @tickets_data.group_by { |t| t[:payment_method] }.transform_values(&:count)
    }
  end
end 