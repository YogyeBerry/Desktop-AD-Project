const http = require('http');
const app = require('../server');

function request(server, path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        host: 'localhost',
        port: address.port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API Endpoint Verification Tests ---');
  const server = app.listen(0);

  try {
    // 1. Health check
    let res = await request(server, '/');
    console.assert(res.status === 200 && res.body.status === 'ok', 'Health check failed');
    console.log('✔ Health check OK');

    // 2. GET /api/paths
    res = await request(server, '/api/paths');
    console.assert(res.status === 200 && res.body.success, 'GET /api/paths failed');
    console.log(`✔ GET /api/paths OK (${res.body.data.length} paths found)`);

    // 3. POST /api/paths
    res = await request(server, '/api/paths', 'POST', {
      title: 'Fullstack Test Path',
      description: 'API verification learning path',
    });
    console.assert(res.status === 201 && res.body.data.id, 'POST /api/paths failed');
    const pathId = res.body.data.id;
    console.log(`✔ POST /api/paths OK (created id: ${pathId})`);

    // 4. GET /api/paths/:id
    res = await request(server, `/api/paths/${pathId}`);
    console.assert(res.status === 200 && res.body.data.title === 'Fullstack Test Path', 'GET /api/paths/:id failed');
    console.log('✔ GET /api/paths/:id OK');

    // 5. PUT /api/paths/:id
    res = await request(server, `/api/paths/${pathId}`, 'PUT', {
      title: 'Updated Test Path',
    });
    console.assert(res.status === 200 && res.body.data.title === 'Updated Test Path', 'PUT /api/paths/:id failed');
    console.log('✔ PUT /api/paths/:id OK');

    // 6. POST /api/paths/:id/topics
    res = await request(server, `/api/paths/${pathId}/topics`, 'POST', {
      title: 'API Topic 1',
      description: 'First topic in test path',
      estimatedDuration: 45,
    });
    console.assert(res.status === 201 && res.body.data.id, 'POST topic failed');
    const topicId = res.body.data.id;
    console.log(`✔ POST /api/paths/:id/topics OK (created topic: ${topicId})`);

    // 7. PUT /api/topics/:id
    res = await request(server, `/api/topics/${topicId}`, 'PUT', {
      title: 'Updated Topic Title',
      estimatedDuration: 50,
    });
    console.assert(res.status === 200 && res.body.data.title === 'Updated Topic Title', 'PUT topic failed');
    console.log('✔ PUT /api/topics/:id OK');

    // 8. PATCH /api/topics/:id/progress
    res = await request(server, `/api/topics/${topicId}/progress`, 'PATCH', {
      isCompleted: true,
    });
    console.assert(res.status === 200 && res.body.data.isCompleted === true, 'PATCH progress failed');
    console.log('✔ PATCH /api/topics/:id/progress OK');

    // 9. POST /api/topics/:id/resources
    res = await request(server, `/api/topics/${topicId}/resources`, 'POST', {
      title: 'Test Documentation',
      type: 'WEBSITE',
      url: 'https://example.com/docs',
    });
    console.assert(res.status === 201 && res.body.data.id, 'POST resource failed');
    const resourceId = res.body.data.id;
    console.log(`✔ POST /api/topics/:id/resources OK (created res: ${resourceId})`);

    // 10. GET /api/resources
    res = await request(server, '/api/resources');
    console.assert(res.status === 200 && res.body.data.some((r) => r.id === resourceId), 'GET /api/resources failed');
    console.log('✔ GET /api/resources OK');

    // 11. PUT /api/resources/:id
    res = await request(server, `/api/resources/${resourceId}`, 'PUT', {
      title: 'Updated Resource Title',
    });
    console.assert(res.status === 200 && res.body.data.title === 'Updated Resource Title', 'PUT resource failed');
    console.log('✔ PUT /api/resources/:id OK');

    // 12. POST /api/topics/:id/sessions
    res = await request(server, `/api/topics/${topicId}/sessions`, 'POST', {
      durationSeconds: 1800,
    });
    console.assert(res.status === 201 && res.body.data.id, 'POST session failed');
    const sessionId = res.body.data.id;
    console.log(`✔ POST /api/topics/:id/sessions OK (created session: ${sessionId})`);

    // 13. GET /api/topics/:id/sessions & GET /api/sessions
    res = await request(server, `/api/topics/${topicId}/sessions`);
    console.assert(res.status === 200 && res.body.data.length >= 1, 'GET topic sessions failed');
    res = await request(server, '/api/sessions');
    console.assert(res.status === 200 && res.body.data.length >= 1, 'GET all sessions failed');
    console.log('✔ GET /api/sessions & /api/topics/:id/sessions OK');

    // 14. Analytics Endpoints
    const [summary, weekly, pathsAna, topicsAna] = await Promise.all([
      request(server, '/api/analytics/summary'),
      request(server, '/api/analytics/weekly'),
      request(server, '/api/analytics/paths'),
      request(server, '/api/analytics/topics'),
    ]);
    console.assert(summary.status === 200 && summary.body.data.totalTopics > 0, 'Analytics summary failed');
    console.assert(weekly.status === 200 && Array.isArray(weekly.body.data), 'Analytics weekly failed');
    console.assert(pathsAna.status === 200 && Array.isArray(pathsAna.body.data), 'Analytics paths failed');
    console.assert(topicsAna.status === 200 && Array.isArray(topicsAna.body.data), 'Analytics topics failed');
    console.log('✔ Analytics endpoints (summary, weekly, paths, topics) all OK');

    // 15. DELETE endpoints
    res = await request(server, `/api/resources/${resourceId}`, 'DELETE');
    console.assert(res.status === 200, 'DELETE resource failed');
    res = await request(server, `/api/topics/${topicId}`, 'DELETE');
    console.assert(res.status === 200, 'DELETE topic failed');
    res = await request(server, `/api/paths/${pathId}`, 'DELETE');
    console.assert(res.status === 200, 'DELETE path failed');
    console.log('✔ DELETE operations (resource, topic, path) OK');

    console.log('\n--- ALL API ENDPOINT TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    server.close();
  }
}

runTests().catch((e) => {
  console.error('API Verification FAILED:', e);
  process.exit(1);
});
