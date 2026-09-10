const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Support PORT from process.env.PORT, command line arg '--port <num>' or '-p <num>', or fallback to 3000
function getPort() {
  if (process.env.PORT) return parseInt(process.env.PORT, 10);
  const args = process.argv.slice(2);
  const portIndex = args.findIndex(a => a === '--port' || a === '-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    return parseInt(args[portIndex + 1], 10);
  }
  if (args[0] && !isNaN(parseInt(args[0], 10))) {
    return parseInt(args[0], 10);
  }
  return 3000;
}

const PORT = getPort();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Path to questions storage
const DATA_DIR = path.join(__dirname, 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const SCORES_FILE = path.join(DATA_DIR, 'scores.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadQuestions() {
  try {
    if (fs.existsSync(QUESTIONS_FILE)) {
      const data = fs.readFileSync(QUESTIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading questions file:', err);
  }
  return [];
}

function saveQuestions(questions) {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf8');
}

function loadScores() {
  try {
    if (fs.existsSync(SCORES_FILE)) {
      const data = fs.readFileSync(SCORES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading scores file:', err);
  }
  return [];
}

function saveScores(scores) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2), 'utf8');
}

// Normalization & Fuzzy matching helper
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/^(the|a|an)\s+/i, '') // remove leading articles
    .replace(/[^\w\s]/g, '') // remove punctuation
    .trim()
    .replace(/\s+/g, ' ');
}

function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function evaluateAnswer(userAnswer, primaryAnswer, acceptedList = [], promptList = []) {
  const normUser = normalizeString(userAnswer);
  if (!normUser) {
    return { correct: false, prompt: false, match: null, reason: 'Empty answer' };
  }

  const allAccepted = [primaryAnswer, ...(acceptedList || [])].filter(Boolean);
  const allPrompts = (promptList || []).filter(Boolean);

  // 1. Exact or Substring match on prompt list first
  for (const p of allPrompts) {
    const normP = normalizeString(p);
    if (normUser === normP || (normUser.length >= 4 && normP.includes(normUser))) {
      return { correct: false, prompt: true, message: `Prompt: Be more specific (matched "${p}")` };
    }
  }

  // 2. Exact or clean match on accepted list
  for (const ans of allAccepted) {
    const normAns = normalizeString(ans);
    if (normUser === normAns) {
      return { correct: true, prompt: false, match: ans };
    }

    // Check surname match: e.g. "Washington" matches "George Washington"
    const ansWords = normAns.split(' ');
    if (ansWords.length > 1) {
      const surname = ansWords[ansWords.length - 1];
      if (surname.length >= 4 && normUser === surname) {
        return { correct: true, prompt: false, match: ans, note: 'Surname accepted' };
      }
    }

    // Typo tolerance (1 typo for 5-7 chars, 2 typos for 8+ chars)
    if (normAns.length >= 5) {
      const dist = levenshteinDistance(normUser, normAns);
      const maxAllowed = normAns.length >= 8 ? 2 : 1;
      if (dist <= maxAllowed) {
        return { correct: true, prompt: false, match: ans, note: 'Accepted with minor typo tolerance' };
      }
    }
  }

  return { correct: false, prompt: false, match: null };
}

// API Routes
app.get('/api/info', (req, res) => {
  const questions = loadQuestions();
  const categories = [...new Set(questions.map(q => q.category))];
  res.json({
    name: 'Kahuna Bowl - Beach Themed Quiz Bowl',
    port: PORT,
    totalQuestions: questions.length,
    categories,
    version: '1.0.0',
    status: 'online'
  });
});

app.get('/api/categories', (req, res) => {
  const questions = loadQuestions();
  const categoryCounts = {};
  questions.forEach(q => {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  });
  res.json({
    categories: Object.keys(categoryCounts).map(cat => ({
      name: cat,
      count: categoryCounts[cat]
    }))
  });
});

app.get('/api/questions', (req, res) => {
  let questions = loadQuestions();
  const { category, difficulty, search } = req.query;

  if (category && category !== 'All') {
    questions = questions.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }
  if (difficulty && difficulty !== 'All') {
    questions = questions.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    questions = questions.filter(q =>
      q.question.toLowerCase().includes(s) ||
      q.answer.toLowerCase().includes(s) ||
      (q.category && q.category.toLowerCase().includes(s))
    );
  }

  res.json({ total: questions.length, questions });
});

app.get('/api/random-tossup', (req, res) => {
  let questions = loadQuestions();
  const { category, difficulty, exclude } = req.query;

  if (category && category !== 'All') {
    questions = questions.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }
  if (difficulty && difficulty !== 'All') {
    questions = questions.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  const excludeIds = exclude ? exclude.split(',') : [];
  let available = questions.filter(q => !excludeIds.includes(q.id));
  if (available.length === 0) available = questions;

  if (available.length === 0) {
    return res.status(404).json({ error: 'No questions match the criteria' });
  }

  const selected = available[Math.floor(Math.random() * available.length)];
  res.json(selected);
});

app.post('/api/check-answer', (req, res) => {
  const { userAnswer, primaryAnswer, accept, promptOn } = req.body;
  if (!primaryAnswer) {
    return res.status(400).json({ error: 'Primary answer is required' });
  }
  const result = evaluateAnswer(userAnswer, primaryAnswer, accept, promptOn);
  res.json(result);
});

app.post('/api/questions', (req, res) => {
  const { category, subcategory, difficulty, question, answer, accept, promptOn, explanation, bonus } = req.body;

  if (!question || !answer || !category) {
    return res.status(400).json({ error: 'Question text, answer, and category are required' });
  }

  const questions = loadQuestions();
  const newQuestion = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category: category.trim(),
    subcategory: subcategory ? subcategory.trim() : 'General',
    difficulty: difficulty || 'Regular',
    question: question.trim(),
    answer: answer.trim(),
    accept: Array.isArray(accept) ? accept : (accept ? accept.split(',').map(s => s.trim()).filter(Boolean) : []),
    promptOn: Array.isArray(promptOn) ? promptOn : (promptOn ? promptOn.split(',').map(s => s.trim()).filter(Boolean) : []),
    explanation: explanation ? explanation.trim() : '',
    bonus: bonus || null,
    isCustom: true
  };

  questions.push(newQuestion);
  saveQuestions(questions);

  res.status(201).json({ success: true, question: newQuestion });
});

app.delete('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  let questions = loadQuestions();
  const initialLen = questions.length;
  questions = questions.filter(q => q.id !== id);
  if (questions.length === initialLen) {
    return res.status(404).json({ error: 'Question not found' });
  }
  saveQuestions(questions);
  res.json({ success: true, message: 'Question deleted' });
});

app.get('/api/scores', (req, res) => {
  const scores = loadScores();
  // Return top 25 scores sorted by score descending
  scores.sort((a, b) => (b.score || 0) - (a.score || 0));
  res.json(scores.slice(0, 25));
});

app.post('/api/scores', (req, res) => {
  const { playerName, score, powers, tens, negs, bonuses, mode, totalTossups } = req.body;
  if (!playerName || score === undefined) {
    return res.status(400).json({ error: 'Player name and score are required' });
  }

  const scores = loadScores();
  const newEntry = {
    id: `score-${Date.now()}`,
    playerName: playerName.trim().substring(0, 25) || 'Beachcomber',
    score: parseInt(score, 10),
    powers: parseInt(powers || 0, 10),
    tens: parseInt(tens || 0, 10),
    negs: parseInt(negs || 0, 10),
    bonuses: parseInt(bonuses || 0, 10),
    mode: mode || 'Solo',
    totalTossups: parseInt(totalTossups || 0, 10),
    date: new Date().toISOString()
  };

  scores.push(newEntry);
  saveScores(scores);

  res.status(201).json({ success: true, entry: newEntry });
});

app.get('/api/export', (req, res) => {
  const questions = loadQuestions();
  res.setHeader('Content-disposition', 'attachment; filename=kahuna-bowl-questions.json');
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify(questions, null, 2));
});

app.post('/api/import', (req, res) => {
  const { questions: importedList } = req.body;
  if (!Array.isArray(importedList) || importedList.length === 0) {
    return res.status(400).json({ error: 'Invalid question list array' });
  }

  const questions = loadQuestions();
  let addedCount = 0;

  for (const item of importedList) {
    if (item.question && item.answer) {
      questions.push({
        id: item.id || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: item.category || 'Beach & Ocean Lore',
        subcategory: item.subcategory || 'General',
        difficulty: item.difficulty || 'Regular',
        question: item.question,
        answer: item.answer,
        accept: Array.isArray(item.accept) ? item.accept : [],
        promptOn: Array.isArray(item.promptOn) ? item.promptOn : [],
        explanation: item.explanation || '',
        bonus: item.bonus || null,
        isCustom: true
      });
      addedCount++;
    }
  }

  saveQuestions(questions);
  res.json({ success: true, added: addedCount, total: questions.length });
});

// Fallback to index.html for SPA routing while ignoring API endpoints
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ======================================================
  🌊 🏄 KAHUNA BOWL - TROPICAL BEACH QUIZ BOWL APP 🌴 🥥
  ======================================================
  ☀️  Server running on port: ${PORT}
  📍  Local Access: http://localhost:${PORT}
  📍  Network Access: http://0.0.0.0:${PORT}
  🌴  Tropical Beach Theme Active & Ready!
  ======================================================
  `);
});
