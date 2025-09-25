const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const dns = require('dns');
const emailExistence = require('email-existence');
const validator = require('validator');
const isDisposable = require('is-disposable-email');
const path = require('path');

const app = express();
const port = 3000;

// Folders
const uploadFolder = path.join(__dirname, 'uploads');
const resultFolder = path.join(__dirname, 'results');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);
if (!fs.existsSync(resultFolder)) fs.mkdirSync(resultFolder);

// Multer for file upload
const upload = multer({ dest: uploadFolder });

// Serve HTML
app.use(express.static('public'));

// Upload CSV
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.send("No file uploaded!");

    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv({ headers: false }))
      .on('data', (row) => {
          const email = row['0'].trim();
          results.push({ email });
      })
      .on('end', () => {
          validateEmails(0, results, res);
      });
});

// Function to check catch-all
function checkCatchAll(domain, callback) {
    // Send fake email to domain
    const fakeEmail = 'thisisnotavalidemail12345@' + domain;
    emailExistence.check(fakeEmail, (err, exists) => {
        callback(exists ? 'Yes' : 'No');
    });
}

// Deep validation recursive
function validateEmails(index, results, res) {
    if (index >= results.length) {
        const filename = `results_${Date.now()}.csv`;
        const outputPath = path.join(resultFolder, filename);

        const header = 'email,syntax,disposable_email,role_email,mx_record,smtp,catch_all';
        const output = results.map(r =>
            `${r.email},${r.syntax},${r.disposable_email},${r.role_email},${r.mx_record},${r.smtp},${r.catch_all}`
        );
        fs.writeFileSync(outputPath, [header, ...output].join('\n'));

        return res.send(`
            <h3>Validation Complete!</h3>
            <a href="/results/${filename}" download>Download Results CSV</a>
        `);
    }

    const email = results[index].email;

    // Step 1: Syntax
    results[index].syntax = validator.isEmail(email) ? 'Valid' : 'Invalid';

    // Step 2: Disposable
    results[index].disposable_email = isDisposable(email) ? 'Yes' : 'No';

    // Step 3: Role email
    const roleEmails = ['admin@', 'info@', 'support@', 'sales@'];
    results[index].role_email = roleEmails.some(role => email.toLowerCase().startsWith(role)) ? 'Yes' : 'No';

    // Step 4: MX check
    const domain = email.split('@')[1];
    dns.resolveMx(domain, (err, addresses) => {
        results[index].mx_record = (err || !addresses || addresses.length === 0) ? 'No' : 'Yes';

        if (results[index].mx_record === 'No') {
            results[index].smtp = 'Invalid';
            results[index].catch_all = 'No';
            return validateEmails(index + 1, results, res);
        }

        // Step 5: SMTP check
        emailExistence.check(email, (error, exists) => {
            results[index].smtp = exists ? 'Valid' : 'Invalid';

            // Step 6: Catch-All detection
            checkCatchAll(domain, (catchAll) => {
                results[index].catch_all = catchAll;
                validateEmails(index + 1, results, res);
            });
        });
    });
}

// Serve results for download
app.use('/results', express.static(resultFolder));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
