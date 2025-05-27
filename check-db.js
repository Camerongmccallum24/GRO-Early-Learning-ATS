const http = require('http');

// Simple function to check database connection
function checkDatabaseConnection() {
  console.log('Checking database connection status...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/system/database-status',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Database Status:');
        console.log('------------------');
        console.log(`Available: ${response.available ? '✅ Connected' : '❌ Not Connected'}`);
        console.log(`Type: ${response.type}`);
        
        if (!response.available) {
          console.log('\n⚠️ DATABASE CONNECTION FAILED ⚠️');
          console.log('Possible reasons:');
          console.log('1. DATABASE_URL environment variable is not set correctly');
          console.log('2. Database server is not running');
          console.log('3. Network connectivity issues');
          console.log('\nCheck your .env file for the correct DATABASE_URL configuration.');
        } else {
          console.log('\n✅ Database connection is working correctly!');
        }
      } catch (error) {
        console.error('Error parsing response:', error);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error(`\n❌ ERROR: Could not connect to server: ${error.message}`);
    console.log('\nIs your server running? Make sure to start the server with "npm start" before running this check.');
  });
  
  req.end();
}

// Run the check
checkDatabaseConnection();
