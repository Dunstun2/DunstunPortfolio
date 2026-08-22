const http = require('http');

// 1. Fetch about list to get editId
http.get('http://localhost:5000/api/about/published', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Current published about:', data);
  });
});
