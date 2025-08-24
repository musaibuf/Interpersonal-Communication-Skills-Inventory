import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Paper, LinearProgress, Alert, CircularProgress, Grid
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';

// --- ICONS ---
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// --- CHART.JS IMPORTS ---
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

import './App.css';

// --- REGISTER CHART.JS COMPONENTS ---
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// --- THEME AND STYLES --- (No changes here)
let theme = createTheme({
  palette: {
    primary: {
      main: '#F57C00',
      light: 'rgba(245, 124, 0, 0.08)',
    },
    secondary: {
      main: '#B31B1B',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#34495e',
    },
    background: {
      default: '#f8f9fa',
      paper: '#FFFFFF',
    },
    action: {
      hover: 'rgba(245, 124, 0, 0.04)'
    }
  },
  typography: {
    fontFamily: 'sans-serif',
    h1: {
      fontWeight: 700,
      color: '#B31B1B',
      textAlign: 'center',
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      color: '#B31B1B',
      textAlign: 'center',
      marginBottom: '1.5rem',
      fontSize: '2rem',
    },
    h5: {
      color: '#F57C00',
      fontWeight: 600,
      borderBottom: '2px solid #F57C00',
      paddingBottom: '0.5rem',
      marginBottom: '1rem',
      fontSize: '1.4rem',
    },
    body1: {
      fontSize: '1rem',
    }
  },
});
theme = responsiveFontSizes(theme);

const containerStyles = {
  padding: { xs: 2, sm: 3, md: 4 },
  margin: { xs: '1rem auto', md: '2rem auto' },
  borderRadius: '15px',
  backgroundColor: 'background.paper',
  border: '1px solid #e9ecef',
  maxWidth: { xs: '100%', sm: '700px', md: '900px' },
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
};

// --- DATA (Questions, Scoring) --- (No changes here)
const sections = [
  {
    title: 'Section I: Sending Clear Messages',
    questions: [
      { id: 1, text: 'Is it difficult for you to talk to other people?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 2, text: 'When you are trying to explain something, do others tend to put words in your mouth, or finish your sentences for you?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 3, text: 'In conversation, do your words usually come out the way you would like?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 4, text: 'Do you find it difficult to express your ideas when they differ from the ideas of people around you?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 5, text: 'Do you assume that the other person knows what you are trying to say, and leave it to him/her to ask you questions?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 6, text: 'Do others seem interested and attentive when you are talking to them?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 7, text: 'When speaking, is it easy for you to recognize how others are reacting to what you are saying?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 8, text: 'Do you ask the other person to tell you how she/he feels about the point you are trying to make?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 9, text: 'Are you aware of how your tone of voice may affect others?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 10, text: 'In conversation, do you look to talk about things of interest to both you and the other person?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
    ],
  },
  {
    title: 'Section II: Listening',
    questions: [
      { id: 11, text: 'In conversation, do you tend to do more talking than the other person does?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 12, text: 'In conversation, do you ask the other person questions when you don’t understand what they’ve said?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 13, text: 'In conversation, do you often try to figure out what the other person is going to say before they’ve finished talking?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 14, text: 'Do you find yourself not paying attention while in conversation with others?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 15, text: 'In conversation, can you easily tell the difference between what the person is saying and how he/she may be feeling?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 16, text: 'After the other person is done speaking, do you clarify what you heard them say before you offer a response?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 17, text: 'In conversation, do you tend to finish sentences or supply words for the other person?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 18, text: 'In conversation, do you find yourself paying most attention to facts and details, and frequently missing the tone of the speakers’ voice?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 19, text: 'In conversation, do you let the other person finish talking before reacting to what she/he says?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 20, text: 'Is it difficult for you to see things from the other person’s point of view?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
    ],
  },
  {
    title: 'Section III: Giving and Getting Feedback',
    questions: [
      { id: 21, text: 'Is it difficult to hear or accept criticism from the other person?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 22, text: 'Do you refrain from saying something that you think will upset someone or make matters worse?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 23, text: 'When someone hurts your feelings, do you discuss this with him/her?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 24, text: 'In conversation, do you try to put yourself in the other person’s shoes?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 25, text: 'Do you become uneasy when someone pays you a compliment?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 26, text: 'Do you find it difficult to disagree with others because you are afraid they will get angry?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 27, text: 'Do you find it difficult to compliment or praise others?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 28, text: 'Do others remark that you always seem to think you are right?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 29, text: 'Do you find that others seem to get defensive when you disagree with their point of view?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 30, text: 'Do you help others to understand you by saying how you feel?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
    ],
  },
  {
    title: 'Section IV: Handling Emotional Interactions',
    questions: [
      { id: 31, text: 'Do you have a tendency to change the subject when the other person’s feelings enter into the discussion?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 32, text: 'Does it upset you a great deal when someone disagrees with you?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 33, text: 'Do you find it difficult to think clearly when you are angry with someone?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 34, text: 'When a problem arises between you and another person, can you discuss it without getting angry?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 35, text: 'Are you satisfied with the way you handle differences with others?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 36, text: 'Do you sulk for a long time when someone upsets you?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 37, text: 'Do you apologize to someone whose feelings you may have hurt?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 38, text: 'Do you admit that you’re wrong when you know that you are/were wrong about something?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
      { id: 39, text: 'Do you avoid or change the topic if someone is expressing his or her feelings in a conversation?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
      { id: 40, text: 'When someone becomes upset, do you find it difficult to continue the conversation?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
    ],
  },
];

function App() {
  const [step, setStep] = useState('welcome');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState({ name: '', company: '' });
  const [responses, setResponses] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const chartRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, currentSectionIndex]);

  const handleStart = () => {
    if (userInfo.name && userInfo.company) {
      setError('');
      setStep('assessment');
    } else {
      setError('Please fill out both your name and company.');
    }
  };

  const handleResponseChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const calculateScores = () => {
    const sectionScores = [0, 0, 0, 0];
    let total = 0;
    const detailedScores = {};

    sections.forEach((section, sectionIndex) => {
      section.questions.forEach((q) => {
        const response = responses[q.id];
        let score = 0;
        if (response && q.scoring) {
          score = q.scoring[response];
          sectionScores[sectionIndex] += score;
          total += score;
        }
        detailedScores[q.id] = score;
      });
    });
    return { sectionScores, total, detailedScores };
  };

  const handleSubmit = async () => {
    if (!validateCurrentSection()) {
      setError('Please answer all questions in this section to continue.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const { sectionScores, total, detailedScores } = calculateScores();
    const payload = {
      name: userInfo.name,
      company: userInfo.company,
      responses,
      scores: {
        section1: sectionScores[0],
        section2: sectionScores[1],
        section3: sectionScores[2],
        section4: sectionScores[3],
        total: total
      },
      detailedScores: detailedScores,
    };

    try {
      await axios.post(`${API_URL}/api/save`, payload);
    } catch (err) {
      console.error("Could not save results to sheet:", err);
    }

    setResults(payload);
    setStep('results');
    setIsSubmitting(false);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setError('');

    const chartImage = chartRef.current ? chartRef.current.toBase64Image() : '';

    const payloadForPdf = {
      ...results,
      chartImage: chartImage,
    };

    try {
      const response = await axios.post(`${API_URL}/api/generate-pdf`, payloadForPdf, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assessment-results-${results.name.replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setError("Sorry, we couldn't generate your PDF at this time. Please try again later.");
    } finally {
      setIsDownloading(false);
    }
  };

  const validateCurrentSection = () => {
    const currentQuestions = sections[currentSectionIndex].questions;
    return currentQuestions.every(q => responses.hasOwnProperty(q.id));
  };

  const handleNextSection = () => {
    if (validateCurrentSection()) {
      setError('');
      if (currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
      }
    } else {
      setError('Please answer all questions in this section to continue.');
    }
  };

  const handlePreviousSection = () => {
    setError('');
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const renderWelcome = () => (
    <Paper elevation={3} sx={containerStyles}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box component="img" src="/logo.png" alt="Company Logo" sx={{ maxWidth: { xs: '100px', sm: '120px' }, height: 'auto' }} />
        <Typography variant="h1">
          Interpersonal Communication Skills Inventory
        </Typography>
      </Box>
      <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal', px: { xs: 1, sm: 2 } }}>
        Assess your skills in sending messages, listening, giving feedback, and handling emotional interactions.
      </Typography>
      <Box sx={{ maxWidth: { xs: '100%', sm: 400 }, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2, px: { xs: 1, sm: 0 } }}>
        <TextField fullWidth label="Your Name" variant="outlined" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} />
        <TextField fullWidth label="Your Company" variant="outlined" value={userInfo.company} onChange={(e) => setUserInfo({ ...userInfo, company: e.target.value })} />
        {error && <Alert severity="error">{error}</Alert>}
        <Button variant="contained" size="large" color="primary" onClick={handleStart} disabled={!userInfo.name || !userInfo.company} startIcon={<RocketLaunchIcon />} sx={{ mt: 2, py: 1.5, width: { xs: '100%', sm: 'auto' }, alignSelf: 'center' }}>
          Start Assessment
        </Button>
      </Box>
    </Paper>
  );

  const renderAssessment = () => {
    const answeredQuestions = Object.keys(responses).length;
    const progress = (answeredQuestions / 40) * 100;
    const currentSection = sections[currentSectionIndex];
    return (
      <Paper sx={containerStyles}>
        <Box sx={{ mb: 3, position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1, pt: 2, px: { xs: 1, sm: 2 } }}>
          <Typography variant="h2" sx={{ mb: 1 }}>Section {currentSectionIndex + 1} of {sections.length}</Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 1 }}>{answeredQuestions} of 40 questions answered</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: '8px', borderRadius: '4px' }} />
        </Box>
        <Box>
          <Typography variant="h5">{currentSection.title}</Typography>
          {currentSection.questions.map((q) => (
            <FormControl key={q.id} component="fieldset" fullWidth sx={{ mb: 2, borderTop: '1px solid #eee', pt: 2 }}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1.5, color: 'text.primary', lineHeight: 1.4 }}>{`${q.id}. ${q.text}`}</FormLabel>
              <RadioGroup value={responses[q.id] || ''} onChange={(e) => handleResponseChange(q.id, e.target.value)} sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, justifyContent: 'center' }}>
                {['usually', 'sometimes', 'seldom'].map((option) => {
                  const isSelected = responses[q.id] === option;
                  return (
                    <FormControlLabel key={option} value={option} control={<Radio sx={{ display: 'none' }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box component="span" sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid', borderColor: isSelected ? 'primary.main' : '#ccc', backgroundColor: isSelected ? 'primary.main' : 'transparent', mr: 2, flexShrink: 0, }} />
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Box>
                      }
                      sx={{ m: 0, flex: { sm: 1 }, p: 1.5, cursor: 'pointer', border: '2px solid', borderColor: isSelected ? 'primary.main' : '#ddd', backgroundColor: isSelected ? 'primary.light' : 'transparent', borderRadius: 2, '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' }, }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          ))}
        </Box>
        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column-reverse', gap: 1.5, mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
          {currentSectionIndex < sections.length - 1 ? (
            <Button variant="contained" fullWidth size="large" onClick={handleNextSection} endIcon={<ArrowForwardIcon />}>Next Section</Button>
          ) : (
            <Button variant="contained" fullWidth size="large" color="primary" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit & View Results'}</Button>
          )}
          {currentSectionIndex > 0 && (<Button variant="outlined" fullWidth onClick={handlePreviousSection} startIcon={<ArrowBackIcon />}>Previous</Button>)}
        </Box>
      </Paper>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    // --- UPDATED: Logic to clean titles and handle plurals ---
    const scoresWithTitles = sections.map((section, i) => ({
      // Use a robust regex to remove "Section [any roman numeral]: "
      title: section.title.replace(/Section (I|II|III|IV): /g, ''),
      score: results.scores[`section${i + 1}`]
    }));

    const maxScore = Math.max(...scoresWithTitles.map(s => s.score));
    const minScore = Math.min(...scoresWithTitles.map(s => s.score));

    const strengthAreas = scoresWithTitles.filter(s => s.score === maxScore).map(s => s.title);
    const improvementAreas = scoresWithTitles.filter(s => s.score === minScore).map(s => s.title);

    const chartData = {
      labels: [
        ['Sending Clear', 'Messages'],
        'Listening',
        ['Giving & Getting', 'Feedback'],
        ['Handling', 'Emotional', 'Interactions'],
      ],
      datasets: [
        {
          data: scoresWithTitles.map(s => s.score),
          backgroundColor: 'rgba(245, 124, 0, 0.4)',
          borderColor: '#F57C00',
          borderWidth: 2,
          pointBackgroundColor: '#F57C00',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#F57C00',
          pointRadius: 5,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          suggestedMin: 0,
          suggestedMax: 30,
          ticks: {
            stepSize: 10,
            backdropColor: 'transparent',
            color: 'rgba(0, 0, 0, 0.5)',
          },
          pointLabels: {
            font: { size: 12 },
            color: '#34495e',
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    };

    const getInterpretation = (score) => {
      if (score >= 22) return { text: 'Area of strength or potential strength', color: 'primary.main' };
      if (score >= 16) return { text: 'Needs more consistent attention', color: 'primary.main' };
      return { text: 'Area that needs improvement', color: 'secondary.main' };
    };

    return (
      <Paper sx={containerStyles}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem' }, color: 'secondary.main' }}>
            Interpersonal Communication<br/>Skills Inventory Results
          </Typography>
          <Typography variant="h6" color="text.secondary" component="p" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            View your scores, strengths, and areas for improvement
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="center" sx={{ my: 2 }}>
          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'relative', height: { xs: '300px', sm: '400px', md: '450px' } }}>
              <Radar ref={chartRef} data={chartData} options={chartOptions} />
            </Box>
            <Typography variant="caption" display="block" textAlign="center" mt={2}>
              This chart visualizes your scores across the four key areas, showing your unique communication profile at a glance.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ backgroundColor: 'secondary.main', color: 'white', textAlign: 'center', p: {xs: 2, sm: 3}, borderRadius: '12px', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.5)', pb: 1, mb: 1 }}>Total Score</Typography>
              <Typography variant="h2" component="p" sx={{ fontWeight: 'bold', fontSize: { xs: '3.5rem', sm: '4rem' }, color: 'white' }}>{results.scores.total} / 120</Typography>
            </Box>
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}><StarIcon /> Area of Strength</Typography>
              {/* --- UPDATED: Pluralization Logic --- */}
              <Typography>
                {strengthAreas.length > 1 ? 'Your highest scores are in: ' : 'Your highest score is in: '}
                <strong>{strengthAreas.join(', ')}</strong>.
              </Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main' }}><TrendingUpIcon /> Area for Improvement</Typography>
              {/* --- UPDATED: Pluralization Logic --- */}
              <Typography>
                {improvementAreas.length > 1 ? 'Areas with potential for growth are: ' : 'An area with potential for growth is: '}
                <strong>{improvementAreas.join(', ')}</strong>.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box my={4}>
          <Typography variant="h4" textAlign="center" gutterBottom>Detailed Breakdown</Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {sections.map((section, i) => {
              const currentScore = results.scores[`section${i + 1}`];
              const interpretation = getInterpretation(currentScore);
              return (
                <Box key={section.title} sx={{ backgroundColor: 'primary.light', borderLeft: '5px solid', borderColor: 'primary.main', p: 2, borderRadius: '8px' }}>
                  <Typography variant="h6" component="h3" sx={{ borderBottom: 'none', mb: 1, color: 'primary.main', fontSize: '1.1rem' }}>{section.title}</Typography>
                  <Typography>Score: {currentScore} / 30 - <Typography component="span" sx={{ color: interpretation.color, fontWeight: 'bold' }}>{interpretation.text}</Typography></Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
          <Button
            variant="contained"
            size="large"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            sx={{ width: { xs: '100%', sm: 'auto' }, py: 1.5 }}
          >
            {isDownloading ? 'Generating PDF...' : 'Download Report'}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Thank you for taking the assessment. Your detailed PDF report includes all scores and interpretations for your records.
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        {step === 'welcome' && renderWelcome()}
        {step === 'assessment' && renderAssessment()}
        {step === 'results' && renderResults()}
      </Container>
    </ThemeProvider>
  );
}

export default App;