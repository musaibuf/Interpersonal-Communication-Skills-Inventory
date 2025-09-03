const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { appendToSheet } = require('./googleSheets');
const { generateChartImage } = require('./generateChart');
const { questions } = require('./questions');

const app = express();
const PORT = process.env.PORT || 5001;

// --- STYLING & DATA CONSTANTS ---
const BRAND_COLOR = '#D9534F';
const TEXT_COLOR = '#333333';
const LIGHT_GRAY = '#F5F5F5';
const STRENGTH_COLOR = '#28A745';
const ATTENTION_COLOR = '#FFC107';
const IMPROVEMENT_COLOR = BRAND_COLOR;

// --- DYNAMIC CORS CONFIGURATION ---
const whitelist = ['https://interpersonal-communication-skills.onrender.com'];
if (process.env.NODE_ENV !== 'production') {
  whitelist.push('http://localhost:3000');
}
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

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

    const chartWidth = 400;
    const chartX = (doc.page.width - chartWidth) / 2;
    doc.image(chartImage, chartX, 350, { fit: [chartWidth, 300] });

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
    
    const maxScore = Math.max(...sections.map(s => s.score));
    const minScore = Math.min(...sections.map(s => s.score));

    const highestAreas = sections.filter(s => s.score === maxScore).map(s => s.name);
    const lowestAreas = sections.filter(s => s.score === minScore).map(s => s.name);

    const highestLabel = highestAreas.length > 1 ? 'Your highest scores are in:' : 'Your highest score is in:';
    const lowestLabel = lowestAreas.length > 1 ? 'Your areas with the lowest score are:' : 'Your area with the lowest score is:';

    const insightsBoxY = doc.y;
    const insightsBoxHeight = 90;
    doc.rect(70, insightsBoxY, 460, insightsBoxHeight).fill(LIGHT_GRAY);
    doc.fillColor(TEXT_COLOR).font('Helvetica-Bold').text('Key Insights', 90, insightsBoxY + 5);
    doc.font('Helvetica').fontSize(10).text(`${highestLabel} ${highestAreas.join(', ')}`, 90, insightsBoxY + 35, { width: 420 });
    
    // --- FIX: Increased the Y coordinate to add more space between the lines ---
    doc.text(`${lowestLabel} ${lowestAreas.join(', ')}`, 90, insightsBoxY + 55, { width: 420 });
    // --- END OF FIX ---

    doc.y = insightsBoxY + insightsBoxHeight + 15;

    const getScoreInterpretation = (score) => {
        if (score <= 15) return { text: 'Needs improvement', color: IMPROVEMENT_COLOR };
        if (score <= 21) return { text: 'Needs more consistent attention', color: ATTENTION_COLOR };
        return { text: 'Area of strength or potential strength', color: STRENGTH_COLOR };
    };

    const sectionTexts = [
        { title: 'Section I: Sending Clear Messages', score: data.scores.section1 },
        { title: 'Section II: Listening', score: data.scores.section2 },
        { title: 'Section III: Giving and Getting Feedback', score: data.scores.section3 },
        { title: 'Section IV: Handling Emotional Interactions', score: data.scores.section4 },
    ];

    const sectionYStart = doc.y;
    sectionTexts.forEach((sec, index) => {
        const y = sectionYStart + index * 60;
        const interpretation = getScoreInterpretation(sec.score);
        doc.rect(70, y, 460, 50).fill(LIGHT_GRAY);
        doc.rect(70, y, 10, 50).fill(BRAND_COLOR);
        doc.fillColor(BRAND_COLOR).font('Helvetica-Bold').fontSize(14).text(sec.title, 90, y + 10);
        doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(11).text(`Score: ${sec.score} / 30 - `)
           .font('Helvetica-Bold').fillColor(interpretation.color).text(interpretation.text, { continued: false });
    });
    
    doc.y = sectionYStart + 4 * 65;

    doc.rect(70, doc.y, 460, 100).fill(BRAND_COLOR);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(14).text('TOTAL SCORE', { align: 'center' }, doc.y + 20);
    doc.fontSize(48).text(`${data.scores.total} / 120`, { align: 'center' });

    // --- PAGE 3: UNDERSTANDING YOUR SCORES ---
    doc.addPage();
    doc.fontSize(22).fillColor(BRAND_COLOR).font('Helvetica-Bold').text('Understanding Your Scores', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(11).fillColor(TEXT_COLOR).font('Helvetica').text('Higher overall scores reflect stronger interpersonal communication skills. The breakdown below explains what the score for each section means. Focus on low-scoring sections for development.', { align: 'left' });
    doc.moveDown(3);

    const interpretations = [
        { range: '22-30', title: 'Area of Strength', color: STRENGTH_COLOR, description: 'Indicates areas of strength or potential strength. You are likely confident and effective in these aspects of communication.' },
        { range: '16-21', title: 'Needs More Consistent Attention', color: ATTENTION_COLOR, description: 'Indicates areas that are generally okay but could be more consistent. Focusing here can turn a moderate skill into a strong one.' },
        { range: '1-15', title: 'Needs Improvement', color: IMPROVEMENT_COLOR, description: 'Indicates areas of communication that would benefit most from focused development and practice.' }
    ];

    const pageMargin = 50;
    interpretations.forEach(item => {
        const boxY = doc.y;
        doc.rect(pageMargin, boxY, doc.page.width - (pageMargin * 2), 70).fill(LIGHT_GRAY);
        doc.rect(pageMargin, boxY, 10, 70).fill(item.color);
        doc.fillColor(item.color).font('Helvetica-Bold').fontSize(14).text(item.title, pageMargin + 20, boxY + 15);
        doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(10).text(`(Scores in the ${item.range} range)`, pageMargin + 20, boxY + 35, { continued: true }).text(` ${item.description}`);
        doc.y = boxY + 70;
        doc.moveDown(3);
    });

    // --- PAGES 4 & 5: DETAILED SCORE BREAKDOWN ---
    const tableBottomMargin = 50;
    const rowHeight = 40;

    const generateTableHeader = () => {
        doc.font('Helvetica-Bold').fontSize(10);
        const y = doc.y;
        doc.text('#', 75, y);
        doc.text('Question', 110, y);
        doc.text('Your Response', 400, y, { width: 80, align: 'center' });
        doc.text('Score', 480, y, { width: 50, align: 'center' });
        doc.moveTo(70, y + 20).lineTo(530, y + 20).strokeColor(TEXT_COLOR).stroke();
        doc.y += 25;
    };

    const generateTableRow = (num, question, response, score) => {
        if (doc.y + rowHeight > doc.page.height - tableBottomMargin) {
            doc.addPage();
            generateTableHeader();
        }
        
        const y = doc.y;
        const responseText = response ? response.charAt(0).toUpperCase() + response.slice(1) : 'N/A';
        doc.fontSize(9).font('Helvetica-Bold').text(num, 75, y, { height: rowHeight, lineBreak: false });
        doc.font('Helvetica').text(question, 110, y, { width: 280, height: rowHeight });
        doc.text(responseText, 400, y, { width: 80, align: 'center', height: rowHeight });
        doc.text(score, 480, y, { width: 50, align: 'center', height: rowHeight });
        doc.moveTo(70, y + rowHeight - 5).lineTo(530, y + rowHeight - 5).strokeColor(LIGHT_GRAY).stroke();
        doc.y += rowHeight;
    };

    const sectionsContent = [
        { title: 'Section I: Sending Clear Messages', start: 1, end: 10 },
        { title: 'Section II: Listening', start: 11, end: 20 },
        { title: 'Section III: Giving and Getting Feedback', start: 21, end: 30 },
        { title: 'Section IV: Handling Emotional Interactions', start: 31, end: 40 },
    ];

    doc.addPage();
    doc.fontSize(22).fillColor(BRAND_COLOR).font('Helvetica-Bold').text('Detailed Score Breakdown', { align: 'center' });
    doc.moveDown(2);

    sectionsContent.forEach((section, secIndex) => {
        const spaceForHeader = 60;
        if (doc.y + spaceForHeader > doc.page.height - tableBottomMargin) {
            doc.addPage();
            doc.fontSize(22).fillColor(BRAND_COLOR).font('Helvetica-Bold').text('Detailed Score Breakdown (Cont.)', { align: 'center' });
            doc.moveDown(2);
        }

        doc.fontSize(16).fillColor(TEXT_COLOR).font('Helvetica-Bold').text(section.title);
        doc.moveDown(1);
        generateTableHeader();

        for (let i = section.start; i <= section.end; i++) {
            const questionData = questions[i - 1];
            const userResponseText = data.responses[i];
            const score = questionData && userResponseText ? questionData.scoring[userResponseText] : 0;
            generateTableRow(i, questionData.text, userResponseText, score);
        }
        doc.moveDown(3);
    });

    // --- FINAL PAGE: Understanding Your Profile & Next Steps ---
    doc.addPage();
    doc.fontSize(22).fillColor(BRAND_COLOR).font('Helvetica-Bold').text('Understanding Your Profile & Next Steps', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(11).fillColor(TEXT_COLOR).font('Helvetica').text('This report provides a snapshot of your communication skills based on your responses. Use these insights as a guide for personal and professional development.', { align: 'left' });
    doc.moveDown(3);

    const suggestions = [
        { title: 'For Sending Clear Messages', text: 'Practice being concise. Before speaking, ask yourself, "What is the single most important point I want to make?" Pause to allow others to process your message.' },
        { title: 'For Listening', text: 'Focus on active listening. Instead of planning your reply while someone is talking, concentrate on their words. Paraphrase what you heard ("So, what you\'re saying is...") to confirm your understanding before you respond.' },
        { title: 'For Giving & Getting Feedback', text: 'When giving feedback, use the "Situation-Behavior-Impact" model. When receiving feedback, listen without immediately defending yourself. Thank the person and take time to reflect on their perspective.' },
        { title: 'For Handling Emotional Interactions', text: 'Acknowledge the other person\'s emotions ("I can see this is frustrating for you"). If you feel yourself getting angry, it\'s okay to say, "I need a moment to think about this." This allows for a more rational and productive conversation.' }
    ];

    suggestions.forEach(item => {
        const boxY = doc.y;
        const boxHeight = 75;
        doc.rect(pageMargin, boxY, doc.page.width - (pageMargin * 2), boxHeight).fill(LIGHT_GRAY);
        doc.rect(pageMargin, boxY, 10, boxHeight).fill(BRAND_COLOR);
        doc.fillColor(BRAND_COLOR).font('Helvetica-Bold').fontSize(14).text(item.title, pageMargin + 20, boxY + 15);
        doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(10).text(item.text, pageMargin + 20, boxY + 35, { width: doc.page.width - (pageMargin * 2) - 30 });
        doc.y = boxY + boxHeight;
        doc.moveDown(2);
    });

    doc.font('Helvetica').text('Continuous self-awareness and practice are the keys to becoming a more effective communicator. We hope this report serves as a valuable step in your journey.');
    doc.moveDown(3);

    doc.fontSize(10).font('Helvetica-Oblique').text('For further clarification regarding your results or guidance on next steps, please consult your trainer or reach out to Musaib at musaib@carnelianco.com', { align: 'center' });

    console.log('New PDF Generated Successfully.');
    doc.end();

  } catch (error) {
    console.error('FATAL ERROR generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An internal server error occurred while generating the PDF.' });
    }
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.timeout = 120000;