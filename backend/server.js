const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit'); // <-- IMPORT PDFKIT
const { appendToSheet } = require('./googleSheets');
const { generateChartImage } = require('./generateChart');

// We no longer need the HTML template file
// const { getPdfHtml } = require('./pdfTemplate');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

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

// --- NEW PDF GENERATION LOGIC USING PDFKIT ---
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.scores) {
      return res.status(400).json({ error: 'Invalid data for PDF generation.' });
    }

    console.log('Generating chart image on server...');
    const chartImage = await generateChartImage(data.scores);

    // Set up the response headers for a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=assessment-results-${data.name.replace(/\s+/g, '-')}.pdf`);

    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Pipe the PDF output directly to the response stream
    doc.pipe(res);

    // --- Add content to the PDF ---

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('Assessment Results', { align: 'center' });
    doc.moveDown();

    // User Info
    doc.fontSize(14).font('Helvetica').text(`Name: ${data.name}`);
    doc.text(`Company: ${data.company || 'N/A'}`);
    doc.moveDown(2);

    // Add the chart image
    // The image is a buffer, which PDFKit handles directly
    doc.image(chartImage, {
      fit: [500, 400], // Fit the image within a 500x400 box
      align: 'center',
      valign: 'center'
    });
    doc.moveDown(2);

    // Add Scores
    doc.fontSize(18).font('Helvetica-Bold').text('Scores Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica')
       .text(`Section 1: ${data.scores.section1}`)
       .text(`Section 2: ${data.scores.section2}`)
       .text(`Section 3: ${data.scores.section3}`)
       .text(`Section 4: ${data.scores.section4}`);
    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Total Score: ${data.scores.total}`);

    // --- Finalize the PDF ---
    console.log('New PDF Generated Successfully.');
    doc.end();

  } catch (error) {
    console.error('FATAL ERROR generating PDF:', error);
    res.status(500).json({ error: 'An internal server error occurred while generating the PDF.' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.timeout = 120000;