// Test script to simulate navigating through admin pages and monitor Socket.IO connections
const http = require('http');

const adminPages = [
  '/admin/hero',
  '/admin/about',
  '/admin/skills',
  '/admin/services',
  '/admin/projects',
  '/admin/events',
  '/admin/experience',
  '/admin/education',
  '/admin/achievements',
  '/admin/certifications',
];

let currentPageIndex = 0;
let navigationCount = 0;
const maxNavigations = 30; // Simulate 30 page navigations

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, length: data.length });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function simulateNavigation() {
  const page = adminPages[currentPageIndex % adminPages.length];
  currentPageIndex++;
  navigationCount++;

  console.log(`\n[${new Date().toLocaleTimeString()}] Navigation ${navigationCount}: ${page}`);

  try {
    const result = await makeRequest(page);
    console.log(`✓ ${page} - Status: ${result.status}, Response size: ${(result.length / 1024).toFixed(2)}KB`);
  } catch (err) {
    console.error(`✗ ${page} - Error: ${err.message}`);
  }

  if (navigationCount < maxNavigations) {
    // Wait 1 second between navigations
    setTimeout(simulateNavigation, 1000);
  } else {
    console.log('\n✓ Navigation test completed!');
    console.log(`Total navigations: ${navigationCount}`);
    console.log('Check backend logs for Socket.IO connection patterns.');
    process.exit(0);
  }
}

console.log('Starting admin page navigation test...');
console.log(`Will navigate through ${maxNavigations} pages`);
console.log(`Pages: ${adminPages.join(', ')}`);
simulateNavigation();
