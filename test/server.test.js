const assert = require('assert');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

console.log('🧪 Starting Kahuna Bowl API & Port Verification Tests...\n');

// Start test server on port 4567
const TEST_PORT = 4567;
const serverProcess = spawn('node', [path.join(__dirname, '..', 'server.js'), '--port', TEST_PORT.toString()], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, PORT: TEST_PORT.toString() },
  stdio: 'inherit'
});

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: urlPath,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Poll until server is responding
async function runTests() {
  let retries = 15;
  while (retries > 0) {
    try {
      await request('/api/info');
      break;
    } catch {
      retries--;
      await new Promise(r => setTimeout(r, 200));
    }
  }

  try {
    console.log('0. Checking app UI exposes a timer toggle...');
    const home = await request('/');
    assert.strictEqual(home.status, 200);
    assert.ok(typeof home.body === 'string' && /id="timerToggleBtn"|Time:\s*(On|Off)|Timer\s*:\s*(On|Off)/i.test(home.body), 'Timer toggle UI is missing');
    console.log('   ✅ App UI includes a timer toggle control.');

    console.log(`\n1. Testing /api/info on custom port ${TEST_PORT}...`);
    const info = await request('/api/info');
    assert.strictEqual(info.status, 200);
    assert.strictEqual(info.body.port, TEST_PORT);
    assert.strictEqual(info.body.status, 'online');
    console.log(`   ✅ /api/info returned port ${info.body.port} and ${info.body.totalQuestions} questions.`);

    console.log('2. Testing /api/categories...');
    const cats = await request('/api/categories');
    assert.strictEqual(cats.status, 200);
    assert.ok(cats.body.categories.length > 0);
    console.log(`   ✅ /api/categories returned ${cats.body.categories.length} categories.`);

    console.log('3. Testing /api/questions query filtering...');
    const qList = await request('/api/questions?category=Science');
    assert.strictEqual(qList.status, 200);
    assert.ok(qList.body.questions.length > 0);
    console.log(`   ✅ /api/questions filtered Science successfully (${qList.body.questions.length} found).`);

    console.log('4. Testing /api/check-answer for exact match, typo tolerance, prompt and aliases...');
    
    // Exact match
    const test1 = await request('/api/check-answer', {
      method: 'POST',
      body: {
        userAnswer: 'mitochondria',
        primaryAnswer: 'Mitochondria',
        accept: ['mitochondrion'],
        promptOn: ['organelle']
      }
    });
    assert.strictEqual(test1.body.correct, true);
    console.log('   ✅ Exact match accepted.');

    // Typo tolerance
    const test2 = await request('/api/check-answer', {
      method: 'POST',
      body: {
        userAnswer: 'mitocondria', // missing 'h'
        primaryAnswer: 'Mitochondria',
        accept: ['mitochondrion'],
        promptOn: ['organelle']
      }
    });
    assert.strictEqual(test2.body.correct, true);
    console.log('   ✅ Typo tolerance accepted.');

    // Prompt recognition
    const test3 = await request('/api/check-answer', {
      method: 'POST',
      body: {
        userAnswer: 'organelle',
        primaryAnswer: 'Mitochondria',
        accept: ['mitochondrion'],
        promptOn: ['organelle']
      }
    });
    assert.strictEqual(test3.body.prompt, true);
    console.log('   ✅ Prompt on general term recognized.');

    // Incorrect answer
    const test4 = await request('/api/check-answer', {
      method: 'POST',
      body: {
        userAnswer: 'ribosome',
        primaryAnswer: 'Mitochondria',
        accept: ['mitochondrion'],
        promptOn: ['organelle']
      }
    });
    assert.strictEqual(test4.body.correct, false);
    assert.strictEqual(test4.body.prompt, false);
    console.log('   ✅ Incorrect answer rejected.');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🏖️🌊\n');
    serverProcess.kill();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    serverProcess.kill();
    process.exit(1);
  }
}

runTests();
