# vps_validator

# Features
1) Full deep validation: Syntax + Disposable + Role + MX + SMTP
2) CSV upload & download
3)Easy to run on VPS (like DartNode VPS-1)
4) Minimal dependencies

   
# Install Dependencies
1) npm init -y
2) npm install express multer csv-parser email-existence validator is-disposable-email

# Run the Server
node validator.js

# example input csv
email,status
test@gmail.com,Valid
fake@invalid.com,Invalid SMTP
info@domain.com,Role Email
temp@mailinator.com,Disposable Email
abc@nonexistent.com,Invalid Domain


