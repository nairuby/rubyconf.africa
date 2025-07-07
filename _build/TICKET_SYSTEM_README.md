# RubyConf Africa Automated Ticket System

## Overview

This automated ticket system generates and delivers conference tickets via email when users complete purchases through PayPal or MPESA. The system includes PDF ticket generation with QR codes, email delivery, and integration with Google Sheets for tracking.

## Features

- 🎫 **Automated Ticket Generation** - Creates PDF tickets with QR codes
- 📧 **Email Delivery** - Sends tickets to customers automatically
- 💳 **Payment Integration** - Supports PayPal and MPESA webhooks
- 📊 **Google Sheets Tracking** - Syncs ticket data to spreadsheets
- 🔐 **Admin Dashboard** - View statistics and manage tickets
- 🧪 **Testing Tools** - Test ticket generation and webhook endpoints

## System Architecture

```
Payment (PayPal/MPESA) → Webhook → Ticket Generation → Email Delivery
                                        ↓
                                 Google Sheets Sync
```

## Installation

1. **Add gems to your Gemfile** (already added):
   ```ruby
   gem 'prawn', '~> 2.4'           # PDF generation
   gem 'prawn-qr', '~> 0.4'        # QR code generation
   gem 'mail', '~> 2.8'            # Email delivery
   gem 'rqrcode', '~> 2.0'         # QR code generation
   gem 'sinatra', '~> 3.0'         # Web framework for webhooks
   gem 'thin', '~> 1.8'            # Web server
   ```

2. **Install dependencies**:
   ```bash
   bundle install
   ```

3. **Setup the system**:
   ```bash
   cd _build
   ruby start_ticket_system.rb setup
   ```

## Configuration

1. **Copy the configuration template**:
   ```bash
   cp _build/config_template.env .env
   ```

2. **Configure your .env file**:

### Email Configuration (Required)
```env
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Webhook Server
```env
WEBHOOK_PORT=4567
```

### Admin Access
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### PayPal Configuration
```env
PAYPAL_VERIFY_IPN=true
PAYPAL_SANDBOX=true  # Set to false for production
```

### Google Sheets Integration
```env
SERVICE_ACCOUNT_JSON={"type": "service_account", ...}
TICKET_SHEET_ID=your-google-sheets-id
TICKET_SHEET_NAME=Tickets
STATS_SHEET_NAME=Statistics
```

## Usage

### 1. Start the Webhook Server

```bash
cd _build
ruby start_ticket_system.rb server
```

The server will start on port 4567 (or your configured port) with these endpoints:

- `POST /webhooks/paypal` - PayPal payment notifications
- `POST /webhooks/mpesa` - MPESA payment notifications
- `POST /webhooks/test` - Test endpoint
- `GET /admin/stats` - Admin statistics
- `GET /admin/tickets` - Admin ticket list
- `GET /health` - Health check

### 2. Test the System

```bash
# Test ticket generation
ruby start_ticket_system.rb test

# Test webhook with curl
curl -X POST http://localhost:4567/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "ticket_type": "Full Pass",
    "amount": 3500,
    "currency": "KSH",
    "method": "Test"
  }'
```

### 3. View Statistics

```bash
ruby start_ticket_system.rb stats
```

### 4. Sync Data to Google Sheets

```bash
ruby start_ticket_system.rb sync
```

## Webhook Integration

### PayPal Setup

1. **Configure PayPal IPN**:
   - Go to your PayPal account settings
   - Add IPN URL: `https://your-domain.com/webhooks/paypal`
   - Enable IPN notifications

2. **Update your PayPal buttons** to include customer information:
   ```html
   <input type="hidden" name="notify_url" value="https://your-domain.com/webhooks/paypal">
   <input type="hidden" name="custom" value="ticket_type=Full Pass">
   ```

### MPESA Setup

Configure your MPESA integration service to send webhooks to:
`https://your-domain.com/webhooks/mpesa`

Expected JSON format:
```json
{
  "status": "success",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "amount": 3500,
  "transaction_id": "ABC123",
  "currency": "KSH"
}
```

## Ticket Generation

### PDF Ticket Features

- **Conference branding** with logo and colors
- **Customer information** (name, email, ticket type)
- **QR code** for verification
- **Ticket ID** for tracking
- **Conference details** (dates, location)
- **Professional styling** with conference colors

### Email Delivery

- **HTML email** with conference branding
- **PDF attachment** with the ticket
- **Confirmation details** and instructions
- **Contact information** for support

## Google Sheets Integration

The system can sync ticket data to Google Sheets with two sheets:

1. **Tickets Sheet**:
   - Ticket ID, Customer Name, Email
   - Ticket Type, Price, Currency
   - Payment Method, Payment ID
   - Purchase Date, Status
   - Conference Details

2. **Statistics Sheet** (optional):
   - Total tickets sold
   - Total revenue
   - Breakdown by ticket type
   - Breakdown by payment method
   - Last updated timestamp

## Admin Features

### Statistics Endpoint
```bash
curl -u admin:password http://localhost:4567/admin/stats
```

### Ticket List Endpoint
```bash
curl -u admin:password http://localhost:4567/admin/tickets
```

## File Structure

```
_build/
├── ticket_system.rb           # Main ticket system class
├── webhook_server.rb          # Sinatra webhook server
├── sync_ticket_data.rb        # Google Sheets sync
├── start_ticket_system.rb     # Management script
├── config_template.env        # Configuration template
└── TICKET_SYSTEM_README.md    # This documentation

_data/
└── tickets.yml                # Ticket data storage

tickets/
├── ticket_ABC123.pdf          # Generated ticket PDFs
└── qr_ABC123.png             # QR code images (temporary)
```

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check SMTP configuration
   - Verify app password for Gmail
   - Check firewall/network restrictions

2. **PDF generation errors**:
   - Ensure Prawn gem is installed
   - Check file permissions in tickets/ directory

3. **Webhook not receiving data**:
   - Verify webhook URL is accessible
   - Check payment service configuration
   - Review server logs

4. **Google Sheets sync failing**:
   - Verify SERVICE_ACCOUNT_JSON is correct
   - Check Google Sheets API permissions
   - Ensure SHEET_ID is correct

### Debug Mode

Add debug logging to webhook server:
```ruby
# In webhook_server.rb
set :logging, true
```

### Testing Webhooks

Use tools like ngrok to test webhooks locally:
```bash
ngrok http 4567
# Use the ngrok URL for webhook configuration
```

## Security Considerations

1. **PayPal IPN Verification**: Always verify PayPal IPNs in production
2. **HTTPS**: Use HTTPS for webhook endpoints
3. **Environment Variables**: Never commit sensitive data to version control
4. **Admin Authentication**: Use strong passwords for admin endpoints
5. **Input Validation**: Validate all webhook data

## Production Deployment

1. **Server Setup**:
   - Use a production web server (Nginx + Passenger)
   - Configure SSL certificates
   - Set up monitoring and logging

2. **Environment Configuration**:
   - Set `PAYPAL_SANDBOX=false` for production
   - Use production SMTP settings
   - Configure proper admin credentials

3. **Backup Strategy**:
   - Regular backups of ticket data
   - Google Sheets as secondary backup
   - Monitor disk space for PDF files

## Support

For issues or questions:
- Email: organisers@rubyconf.africa
- Check server logs for error messages
- Use the test endpoints to verify functionality

## License

This ticket system is part of the RubyConf Africa project. 