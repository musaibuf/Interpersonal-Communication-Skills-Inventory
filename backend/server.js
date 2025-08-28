const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { appendToSheet } = require('./googleSheets');
const { generateChartImage } = require('./generateChart');
const { questions } = require('./questions'); // Import the new questions data structure

const app = express();
const PORT = process.env.PORT || 5001;

// --- STYLING CONSTANTS ---
const BRAND_COLOR = '#D9534F';
const TEXT_COLOR = '#333333';
const LIGHT_GRAY = '#F5F5F5';

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.post('/api/save', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.scores) {
      return res.status(400).json({ error: 'Invalid data for saving.' });
    }
    // The appendToSheet function needs to be compatible with the data structure
    // We will pass the full data object to it. Ensure it's handled correctly there.
    await appendToSheet(data);
    console.log('Data saved to Google Sheets successfully.');
    res.status(200).json({ message: 'Data saved successfully.' });
  } catch (error) {
    console.error('Error saving data to Google Sheets:', error);
    res.status(500).json({ error: 'An internal server error occurred while saving data.' });
  }
});

app.post('/api/generate-pdf', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.scores || !data.responses) {
      return res.status(400).json({ error: 'Invalid data for PDF generation.' });
    }

    console.log('Generating chart image on server...');
    const chartImage = await generateChartImage(data.scores);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=assessment-results-${data.name.replace(/\s+/g, '-')}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    doc.font('Helvetica');

    // --- PAGE 1: TITLE AND CHART ---
    if (fs.existsSync('./logo.png')) {
        doc.image('./logo.png', 275, 40, { width: 50 });
    }
    
    doc.moveDown(4);
    doc.fontSize(22).fillColor(TEXT_COLOR).font('Helvetica-Bold').text('Interpersonal Communication Skills Inventory', { align: 'center' });
    doc.fontSize(14).fillColor(TEXT_COLOR).font('Helvetica').text('Assessment Results', { align: 'center' });
    doc.moveDown(1);
    doc.strokeColor(BRAND_COLOR).lineWidth(1).moveTo(100, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(2);

    const detailsY = doc.y;
    doc.fontSize(11).fillColor(TEXT_COLOR).font('Helvetica-Bold').text('Name:', 70, detailsY);
    doc.font('Helvetica').text(data.name, 150, detailsY);
    doc.font('Helvetica-Bold').text('Company:', 70, detailsY + 20);
    doc.font('Helvetica').text(data.company || 'N/A', 150, detailsY + 20);
    doc.font('Helvetica-Bold').text('Date:', 70, detailsY + 40);
    doc.font('Helvetica').text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 150, detailsY + 40);

    doc.image(chartImage, { fit: [400, 300], align: 'center', y: 350 });
    doc.fontSize(10).fillColor(TEXT_COLOR).text('The chart above provides a visual snapshot of your communication profile. The further a point is from the center, the higher your score in that specific area.', 70, 680, { align: 'center' });

    // --- PAGE 2: RESULTS SUMMARY ---
    doc.addPage();
    doc.fontSize(22).fillColor(BRAND_COLOR).font('Helvetica-Bold').text('Results Summary', { align: 'center' });
    doc.moveDown(2);

    const sections = [
        { name: 'Sending Clear Messages', score: data.scores.section1 },
        { name: 'Listening', score: data.scores.section2 },
        { name: 'Giving and Getting Feedback', score: data.scores.section3 },
        { name: 'Handling Emotional Interactions', score: data.scores.section4 },
    ];
    const sortedScores = [...sections].sort((a, b) => a.score - b.score);
    const areaForImprovement = sortedScores[0].name;
    const areaOfStrength = sortedScores[3].name;

    doc.rect(70, doc.y, 460, 80).fill(LIGHT_GRAY);
    doc.fillColor(TEXT_COLOR).font('Helvetica-Bold').text('Key Insights', 90, doc.y + 10);
    doc.font('Helvetica').fontSize(10).text(`Area of Strength: ${areaOfStrength}`, 90, doc.y + 15);
    doc.text(`Area for Improvement: ${areaForImprovement}`, 90, doc.y + 5);
    doc.y += 30;

    const sectionTexts = [
        { title: 'Section I: Sending Clear Messages', score: data.scores.section1 },
        { title: 'Section II: Listening', score: data.scores.section2 },
        { title: 'Section III: Giving and Getting Feedback', score: data.scores.section3 },
        { title: 'Section IV: Handling Emotional Interactions', score: data.scores.section4 },
    ];

    const sectionYStart = doc.y;
    sectionTexts.forEach((sec, index) => {
        const y = sectionYStart + index * 60;
        doc.rect(70, y, 460, 50).fill(LIGHT_GRAY);
        doc.rect(70, y, 10, 50).fill(BRAND_COLOR);
        doc.fillColor(BRAND_COLOR).font('Helvetica-Bold').fontSize(14).text(sec.title, 90, y + 10);
        doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(11).text(`Score: ${sec.score} / 30 - Needs improvement`, 90, y + 30);
    });
    
    doc.y = sectionYStart + 4 * 65;

    doc.rect(70, doc.y, 460, 100).fill(BRAND_COLOR);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(14).text('TOTAL SCORE', { align: 'center' }, doc.y + 20);
    doc.fontSize(48).text(`${data.scores.total} / 120`, { align: 'center' });

    // --- PAGES 3 & 4: DETAILED SCORE BREAKDOWN ---
    const generateTableRow = (y, num, question, response, score) => {
        const responseText = response ? response.charAt(0).toUpperCase() + response.slice(1) : 'N/A';
        doc.fontSize(9).font('Helvetica-Bold').text(num, 75, y);
        doc.font('Helvetica').text(question, 110, y, { width: 280 });
        doc.text(responseText, 400, y, { width: 80, align: 'center' });
        doc.text(score, 480, y, { width: 50, align: 'center' });
        doc.moveTo(70, y + 35).lineTo(530, y + 35).strokeColor(LIGHT_GRAY).stroke();
    };
    
    const generateTableHeader = (y) => {
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('#', 75, y);
        doc.text('Question', 110, y);
        doc.text('Your Response', 400, y, { width: 80, align: 'center' });
        doc.text('Score', 480, y, { width: 50, align: 'center' });
        doc.moveTo(70, y + 20).lineTo(530, y + 20).strokeColor(TEXT_COLOR).stroke();
    };

    const sectionsContent = [
        { title: 'Section I: Sending Clear Messages', start: 1, end: 10 },
        { title: 'Section II: Listening', start: 11, end: 20 },
        { title: 'Section III: Giving and Getting Feedback', start: 21, end: 30 },
        { title: 'Section IV: Handling Emotional Interactions', start: 31, end: 40 },
    ];

    let currentPage = 3;
    sectionsContent.forEach((section, secIndex) => {
        if (secIndex === 0 || secIndex === 2) {
            doc.addPage();
            let pageTitle = 'Detailed Score Breakdown';
            if (currentPage > 3) pageTitle += ' (Cont.)';
            doc.fontSize(22).fillColor(BRAND_COLOR).font('Helvetica-Bold').text(pageTitle, { align: 'center' });
            doc.moveDown(2);
            currentPage++;
        }

        doc.fontSize(16).fillColor(TEXT_COLOR).font('Helvetica-Bold').text(section.title);
        doc.moveDown(1);
        let currentY = doc.y;
        generateTableHeader(currentY);
        currentY += 35;

        for (let i = section.start; i <= section.end; i++) {
            const questionData = questions[i - 1];
            const userResponseText = data.responses[i];
            const score = questionData && userResponseText ? questionData.scoring[userResponseText] : 0;
            
            generateTableRow(currentY, i, questionData.text, userResponseText, score);
            currentY += 45;
        }
        doc.y = currentY;
        doc.moveDown(2);
    });

    // --- PAGE 5: NEXT STEPS ---
    doc.addPage();
    doc.fontSize(22).fillColor(BRAND_COLOR).font('Helvetica-Bold').text('Understanding Your Profile & Next Steps', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(11).fillColor(TEXT_COLOR).font('Helvetica').text('This report provides a snapshot of your communication skills based on your responses. Use these insights as a guide for personal and professional development.', { align: 'left' });
    doc.moveDown(2);

    doc.fontSize(14).font('Helvetica-Bold').text('Suggestions for Improvement:');
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica').list([
        'For Sending Clear Messages: Practice being concise. Before speaking, ask yourself, "What is the single most important point I want to make?" Pause to allow others to process your message.',
        'For Listening: Focus on active listening. Instead of planning your reply while someone is talking, concentrate on their words. Paraphrase what you heard ("So, what you\'re saying is...") to confirm your understanding before you respond.',
        'For Giving & Getting Feedback: When giving feedback, use the "Situation-Behavior-Impact" model. When receiving feedback, listen without immediately defending yourself. Thank the person and take time to reflect on their perspective.',
        'For Handling Emotional Interactions: Acknowledge the other person\'s emotions ("I can see this is frustrating for you"). If you feel yourself getting angry, it\'s okay to say, "I need a moment to think about this." This allows for a more rational and productive conversation.'
    ], { bulletRadius: 2, textIndent: 10, indent: 20 });
    doc.moveDown(2);

    doc.text('Continuous self-awareness and practice are the keys to becoming a more effective communicator. We hope this report serves as a valuable step in your journey.');
    doc.moveDown(3);
    doc.text('Thank you for taking the assessment.', { align: 'center' });

    console.log('New PDF Generated Successfully.');
    doc.end();

  } catch (error) {
    console.error('FATAL ERROR generating PDF:', error);
    // Ensure we don't try to write to the stream if it's already closed or errored
    if (!res.headersSent) {
      res.status(500).json({ error: 'An internal server error occurred while generating the PDF.' });
    }
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.timeout = 120000;