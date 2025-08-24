const fs = require('fs');
const path = require('path');

const getLogoBase64 = () => {
  try {
    const logoPath = path.join(__dirname, 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    console.error("Error reading logo.png:", error);
    return '';
  }
};

const sectionsData = [
  {
    title: 'Section I: Sending Clear Messages',
    questions: [
      { id: 1, text: 'Is it difficult for you to talk to other people?' },
      { id: 2, text: 'When you are trying to explain something, do others tend to put words in your mouth, or finish your sentences for you?' },
      { id: 3, text: 'In conversation, do your words usually come out the way you would like?' },
      { id: 4, text: 'Do you find it difficult to express your ideas when they differ from the ideas of people around you?' },
      { id: 5, text: 'Do you assume that the other person knows what you are trying to say, and leave it to him/her to ask you questions?' },
      { id: 6, text: 'Do others seem interested and attentive when you are talking to them?' },
      { id: 7, text: 'When speaking, is it easy for you to recognize how others are reacting to what you are saying?' },
      { id: 8, text: 'Do you ask the other person to tell you how she/he feels about the point you are trying to make?' },
      { id: 9, text: 'Are you aware of how your tone of voice may affect others?' },
      { id: 10, text: 'In conversation, do you look to talk about things of interest to both you and the other person?' },
    ],
  },
  {
    title: 'Section II: Listening',
    questions: [
        { id: 11, text: 'In conversation, do you tend to do more talking than the other person does?' },
        { id: 12, text: 'In conversation, do you ask the other person questions when you don’t understand what they’ve said?' },
        { id: 13, text: 'In conversation, do you often try to figure out what the other person is going to say before they’ve finished talking?' },
        { id: 14, text: 'Do you find yourself not paying attention while in conversation with others?' },
        { id: 15, text: 'In conversation, can you easily tell the difference between what the person is saying and how he/she may be feeling?' },
        { id: 16, text: 'After the other person is done speaking, do you clarify what you heard them say before you offer a response?' },
        { id: 17, text: 'In conversation, do you tend to finish sentences or supply words for the other person?' },
        { id: 18, text: 'In conversation, do you find yourself paying most attention to facts and details, and frequently missing the tone of the speakers’ voice?' },
        { id: 19, text: 'In conversation, do you let the other person finish talking before reacting to what she/he says?' },
        { id: 20, text: 'Is it difficult for you to see things from the other person’s point of view?' },
    ],
  },
  {
    title: 'Section III: Giving and Getting Feedback',
    questions: [
        { id: 21, text: 'Is it difficult to hear or accept criticism from the other person?' },
        { id: 22, text: 'Do you refrain from saying something that you think will upset someone or make matters worse?' },
        { id: 23, text: 'When someone hurts your feelings, do you discuss this with him/her?' },
        { id: 24, text: 'In conversation, do you try to put yourself in the other person’s shoes?' },
        { id: 25, text: 'Do you become uneasy when someone pays you a compliment?' },
        { id: 26, text: 'Do you find it difficult to disagree with others because you are afraid they will get angry?' },
        { id: 27, text: 'Do you find it difficult to compliment or praise others?' },
        { id: 28, text: 'Do others remark that you always seem to think you are right?' },
        { id: 29, text: 'Do you find that others seem to get defensive when you disagree with their point of view?' },
        { id: 30, text: 'Do you help others to understand you by saying how you feel?' },
    ],
  },
  {
    title: 'Section IV: Handling Emotional Interactions',
    questions: [
        { id: 31, text: 'Do you have a tendency to change the subject when the other person’s feelings enter into the discussion?' },
        { id: 32, text: 'Does it upset you a great deal when someone disagrees with you?' },
        { id: 33, text: 'Do you find it difficult to think clearly when you are angry with someone?' },
        { id: 34, text: 'When a problem arises between you and another person, can you discuss it without getting angry?' },
        { id: 35, text: 'Are you satisfied with the way you handle differences with others?' },
        { id: 36, text: 'Do you sulk for a long time when someone upsets you?' },
        { id: 37, text: 'Do you apologize to someone whose feelings you may have hurt?' },
        { id: 38, text: 'Do you admit that you’re wrong when you know that you are/were wrong about something?' },
        { id: 39, text: 'Do you avoid or change the topic if someone is expressing his or her feelings in a conversation?' },
        { id: 40, text: 'When someone becomes upset, do you find it difficult to continue the conversation?' },
    ],
  },
];

const getPdfHtml = (data) => {
  const { name, company, scores, responses, detailedScores, chartImage } = data;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const logoSrc = getLogoBase64();

  const getInterpretation = (score) => {
    if (score >= 22) return { text: 'Area of strength or potential strength', color: '#F57C00' };
    if (score >= 16) return { text: 'Needs more consistent attention', color: '#F57C00' };
    return { text: 'Needs improvement', color: '#B31B1B' };
  };

  const sections = [
    { title: 'Section I: Sending Clear Messages', score: scores.section1 },
    { title: 'Section II: Listening', score: scores.section2 },
    { title: 'Section III: Giving and Getting Feedback', score: scores.section3 },
    { title: 'Section IV: Handling Emotional Interactions', score: scores.section4 },
  ];

  const scoresWithTitles = sectionsData.map((section, i) => ({
    title: section.title.replace(/Section I+: /g, ''),
    score: scores[`section${i + 1}`]
  }));
  const maxScore = Math.max(...scoresWithTitles.map(s => s.score));
  const minScore = Math.min(...scoresWithTitles.map(s => s.score));
  const strengthAreas = scoresWithTitles.filter(s => s.score === maxScore).map(s => s.title);
  const improvementAreas = scoresWithTitles.filter(s => s.score === minScore).map(s => s.title);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Assessment Results</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
        body { font-family: 'Lato', sans-serif; margin: 0; color: #34495e; background-color: #ffffff; }
        .page { padding: 40px 50px; max-width: 800px; margin: 0 auto; }
        .page-break { page-break-before: always; }
        .header { text-align: center; margin-bottom: 20px; }
        .header img.logo { max-height: 60px; margin-bottom: 15px; }
        .header h1 { font-size: 32px; color: #B31B1B; margin: 0; font-weight: 700; line-height: 1.2; }
        .header h2 { font-size: 28px; color: #B31B1B; }
        .header p { font-size: 16px; color: #7f8c8d; margin-top: 5px; }
        .underline { border-bottom: 2px solid #F57C00; width: 100%; margin: 20px 0; }
        .user-info { margin-bottom: 20px; font-size: 16px; line-height: 1.6; }
        .user-info span { font-weight: 700; color: #2c3e50; display: inline-block; width: 90px; }
        .section { background-color: rgba(245, 124, 0, 0.08); border-left: 4px solid #F57C00; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
        .section h3 { margin: 0 0 8px; font-size: 18px; color: #F57C00; font-weight: 700; }
        .section p { margin: 0; font-size: 16px; }
        .total-score { background-color: #B31B1B; color: #ffffff; padding: 20px; text-align: center; border-radius: 12px; margin-top: 20px; }
        .total-score h2 { margin: 0; font-size: 20px; font-weight: 400; text-transform: uppercase; letter-spacing: 1px; }
        .total-score p { margin: 5px 0 0; font-size: 56px; font-weight: 700; }
        .chart-container { text-align: center; margin: 40px 0; }
        .chart-container img { max-width: 90%; height: auto; }
        .chart-caption { text-align: center; font-size: 14px; color: #7f8c8d; margin-top: 10px; }
        .insights-box { border: 1px solid #ecf0f1; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .insights-box h4 { margin: 0 0 10px; font-size: 16px; color: #2c3e50; }
        .breakdown-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .breakdown-table th, .breakdown-table td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 11px; }
        .breakdown-table th { background-color: #f2f2f2; font-weight: bold; }
        .breakdown-table td:nth-child(1) { width: 5%; text-align: center; }
        .breakdown-table td:nth-child(3) { width: 15%; text-align: center; text-transform: capitalize; }
        .breakdown-table td:nth-child(4) { width: 10%; text-align: center; font-weight: bold; }
        .breakdown-section h3 { font-size: 22px; color: #B31B1B; margin-bottom: 10px; }
        .next-steps p { font-size: 14px; line-height: 1.6; }
        .next-steps ul { padding-left: 20px; }
        .next-steps li { margin-bottom: 10px; font-size: 14px; }
      </style>
    </head>
    <body>
      <!-- PAGE 1: VISUAL PROFILE -->
      <div class="page">
        <div class="header">
          ${logoSrc ? `<img src="${logoSrc}" alt="Company Logo" class="logo">` : ''}
          <h1>Interpersonal Communication Skills Inventory</h1>
          <p>Assessment Results</p>
        </div>
        <div class="underline"></div>
        <div class="user-info">
          <p><span>Name:</span> ${name}</p>
          <p><span>Company:</span> ${company}</p>
          <p><span>Date:</span> ${date}</p>
        </div>
        <div class="chart-container"><img src="${chartImage}" alt="Communication Profile Chart"></div>
        <p class="chart-caption">
          The chart above provides a visual snapshot of your communication profile. The further a point is from the center, the higher your score in that specific area.
        </p>
      </div>

      <!-- PAGE 2: KEY INSIGHTS & SUMMARY -->
      <div class="page page-break">
        <div class="header"><h2>Results Summary</h2></div>
        <div class="insights-box">
          <h4>Key Insights</h4>
          <p><strong>Area of Strength:</strong> Your highest score is in ${strengthAreas.join(', ')}.</p>
          <p><strong>Area for Improvement:</strong> An area with potential for growth is ${improvementAreas.join(', ')}.</p>
        </div>
        ${sections.map(section => `
          <div class="section">
            <h3>${section.title}</h3>
            <p>Score: ${section.score} / 30 - <span style="color: ${getInterpretation(section.score).color}; font-weight: 700;">${getInterpretation(section.score).text}</span></p>
          </div>
        `).join('')}
        <div class="total-score"><h2>Total Score</h2><p>${scores.total} / 120</p></div>
      </div>

      <!-- PAGE 3 & 4: DETAILED BREAKDOWN -->
      <div class="page page-break">
        <div class="header"><h2>Detailed Score Breakdown</h2></div>
        ${sectionsData.map((section, index) => `
          ${index === 2 ? '<div class="page-break"><div class="header"><h2>Detailed Score Breakdown (Cont.)</h2></div></div>' : ''}
          <div class="breakdown-section">
            <h3>${section.title}</h3>
            <table class="breakdown-table">
              <thead><tr><th>#</th><th>Question</th><th>Your Response</th><th>Score</th></tr></thead>
              <tbody>
                ${section.questions.map(q => `
                  <tr>
                    <td>${q.id}</td>
                    <td>${q.text}</td>
                    <td>${responses[q.id] || 'N/A'}</td>
                    <td>${detailedScores[q.id]}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </div>

      <!-- PAGE 5: NEXT STEPS -->
      <div class="page page-break next-steps">
        <div class="header"><h2>Understanding Your Profile & Next Steps</h2></div>
        <p>This report provides a snapshot of your communication skills based on your responses. Use these insights as a guide for personal and professional development.</p>
        <h4>Suggestions for Improvement:</h4>
        <ul>
          <li><strong>For Sending Clear Messages:</strong> Practice being concise. Before speaking, ask yourself, "What is the single most important point I want to make?" Pause to allow others to process your message.</li>
          <li><strong>For Listening:</strong> Focus on active listening. Instead of planning your reply while someone is talking, concentrate on their words. Paraphrase what you heard ("So, what you're saying is...") to confirm your understanding before you respond.</li>
          <li><strong>For Giving & Getting Feedback:</strong> When giving feedback, use the "Situation-Behavior-Impact" model. When receiving feedback, listen without immediately defending yourself. Thank the person and take time to reflect on their perspective.</li>
          <li><strong>For Handling Emotional Interactions:</strong> Acknowledge the other person's emotions ("I can see this is frustrating for you"). If you feel yourself getting angry, it's okay to say, "I need a moment to think about this." This allows for a more rational and productive conversation.</li>
        </ul>
        <p>Continuous self-awareness and practice are the keys to becoming a more effective communicator. We hope this report serves as a valuable step in your journey.</p>
        <div class="underline" style="margin-top: 40px;"></div>
        <p style="text-align: center; color: #7f8c8d;">Thank you for taking the assessment.</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getPdfHtml };