const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { getPdfHtml } = require('./pdfTemplate');
const { appendToSheet } = require('./googleSheets');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());

// --- THIS IS THE CRITICAL FIX ---
// Increase the limit for JSON request bodies to handle the large chart image data.
// This must come BEFORE your app.post routes.
app.use(express.json({ limit: '5mb' }));


// Endpoint to save data to Google Sheets
app.post('/api/save', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.scores) {
      return res.status(400).json({ error: 'Invalid data for saving.' });
    }
    await appendToSheet(data);
    console.log('Data saved to Google Sheets successfully.');
    res.status(200).json({ message: 'Data saved successfully.' });
  } catch (error) {
    console.error('Error saving data to Google Sheets:', error);
    res.status(500).json({ error: 'An internal server error occurred while saving data.' });
  }
});

// Endpoint to generate the PDF
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.scores) {
      return res.status(400).json({ error: 'Invalid data for PDF generation.' });
    }

    console.log('Generating the new, multi-page PDF...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    const htmlContent = getPdfHtml(data);
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    await browser.close();
    console.log('New PDF Generated Successfully.');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=assessment-results-${data.name.replace(/\s+/g, '-')}.pdf`);
    res.send(pdfBuffer);
  } catch (error)
  {
    console.error('FATAL ERROR generating PDF:', error);
    res.status(500).json({ error: 'An internal server error occurred while generating the PDF.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});