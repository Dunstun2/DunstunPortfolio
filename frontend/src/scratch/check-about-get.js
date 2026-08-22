const http = require('http');

http.get('http://localhost:5000/api/about/published', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const row = parsed.data;
      const corp = row?.corporate_data;
      console.log('typeof corporate_data:', typeof corp);
      if (typeof corp === 'string') {
        console.log('corporate_data is a STRING (double-encoded!)');
        console.log('First 200 chars:', corp.slice(0, 200));
        // Try parsing it
        try {
          const inner = JSON.parse(corp);
          console.log('After parse - type:', typeof inner);
          console.log('After parse - keys count:', Object.keys(inner).length);
          console.log('business_name:', inner.business_name);
        } catch(e) {
          console.log('Failed to parse inner:', e.message);
          // Maybe double-encoded
          try {
            const inner = JSON.parse(JSON.parse(corp));
            console.log('After double-parse - business_name:', inner.business_name);
          } catch(e2) {
            console.log('Double parse also failed');
          }
        }
      } else {
        console.log('corporate_data is an OBJECT - keys:', Object.keys(corp || {}).length);
        console.log('business_name:', corp?.business_name);
      }
    } catch(e) {
      console.log('Error:', e.message);
    }
  });
});
