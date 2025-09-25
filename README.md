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
no header only email

# test port 25 is on or not?
telnet smtp.gmail.com 25



