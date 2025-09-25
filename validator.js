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

// Multer
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
          results.push({ email, status: 'Pending' });
      })
      .on('end', () => {
          validateEmails(0, results, res);
      });
});

// Deep validation recursive
function validateEmails(index, results, res) {
    if (index >= results.length) {
        const filename = `results_${Date.now()}.csv`;
        const outputPath = path.join(resultFolder, filename);
        const output = results.map(r => `${r.email},${r.status}`).join('\n');
        fs.writeFileSync(outputPath, output);

        return res.send(`
            <h3>Validation Complete!</h3>
            <a href="/results/${filename}" download>Download Results CSV</a>
        `);
    }

    const email = results[index].email;

    // Step 1: Syntax
    if (!validator.isEmail(email)) {
        results[index].status = 'Invalid Syntax';
        return validateEmails(index + 1, results, res);
    }

    // Step 2: Disposable
    if (isDisposable(email)) {
        results[index].status = 'Disposable Email';
        return validateEmails(index + 1, results, res);
    }

    // Step 3: Role email (optional)
    const roleEmails = ['admin@', 'info@', 'support@', 'sales@'];
    if (roleEmails.some(role => email.toLowerCase().startsWith(role))) {
        results[index].status = 'Role Email';
        return validateEmails(index + 1, results, res);
    }

    // Step 4: MX check
    const domain = email.split('@')[1];
    dns.resolveMx(domain, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
            results[index].status = 'Invalid Domain';
            return validateEmails(index + 1, results, res);
        }

        // Step 5: SMTP check
        emailExistence.check(email, (error, exists) => {
            results[index].status = exists ? 'Valid' : 'Invalid SMTP';
            validateEmails(index + 1, results, res);
        });
    });
}

// Serve results for download
app.use('/results', express.static(resultFolder));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
