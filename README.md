# vps_validator

# Features
1) Full deep validation: Syntax + Disposable + Role + MX + SMTP
2) CSV upload & download
3) Easy to run on VPS (like DartNode VPS-1)
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

# deep Features
1️⃣ CSV Upload

Upload CSV files with no headers.

Each row should contain a single email address.

2️⃣ Syntax Validation

Checks if the email is formatted correctly according to standard rules.

Example:

test@gmail.com → Valid

invalid@@example.com → Invalid

3️⃣ Disposable Email Detection

Detects temporary email addresses used for one-time registrations.

Uses the is-disposable-email package.

Example:

temp@mailinator.com → Yes

realuser@gmail.com → No

4️⃣ Role Email Detection

Flags emails that belong to general-purpose or shared inboxes.

Common role emails: admin@, info@, support@, sales@

Example:

admin@company.com → Yes

user@company.com → No

5️⃣ MX Record Check

Verifies that the domain has mail servers (MX records).

Detects invalid domains that cannot receive emails.

Example:

test@gmail.com → Yes

fake@nonexistent.com → No

6️⃣ SMTP Mailbox Check

Connects to the mail server via SMTP to check if the specific mailbox exists.

Returns Valid or Invalid.

Helps reduce false positives.

Example:

realuser@gmail.com → Valid

fakeuser@gmail.com → Invalid

7️⃣ Catch-All Domain Detection

Detects domains that accept all emails (catch-all).

Example:

catchall@domain.com → Yes

noncatchall@gmail.com → No

Important because SMTP check alone may be unreliable for catch-all domains.

8️⃣ Detailed CSV Output

Generates a downloadable CSV with all validation steps.

Headers:

email,syntax,disposable_email,role_email,mx_record,smtp,catch_all


Example output:

email,syntax,disposable_email,role_email,mx_record,smtp,catch_all
test@gmail.com,Valid,No,No,Yes,Valid,No
fake@invalid.com,Valid,No,No,Yes,Invalid,No
admin@company.com,Valid,No,Yes,Yes,Valid,No
temp@mailinator.com,Valid,Yes,No,Yes,Valid,No
abc@nonexistent.com,Valid,No,No,No,Invalid,No

9️⃣ VPS Ready

Runs on any Node.js compatible VPS.

Can be accessed via browser at http://YOUR_VPS_IP:3000/.

Port 25 must be open for SMTP verification.

🔟 Sequential & Safe Processing

Processes emails one by one to avoid server blocking.

Checks all validation steps in order: syntax → disposable → role → MX → SMTP → catch-all.

