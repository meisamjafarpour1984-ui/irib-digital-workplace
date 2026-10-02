const http = require('http');

// Test login
const loginData = JSON.stringify({
  personnelCode: 'ADMIN001',
  password: 'admin123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Login response:', data);
    try {
      const loginResult = JSON.parse(data);
      if (loginResult.challengeId) {
        // Verify OTP
        verifyOtp(loginResult.challengeId);
      } else if (loginResult.accessToken) {
        // Direct login (no OTP required)
        testSmsSend(loginResult.accessToken);
      }
    } catch (e) {
      console.error('Error parsing login response:', e);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('Login error:', e);
});

loginReq.write(loginData);
loginReq.end();

function verifyOtp(challengeId) {
  const otpData = JSON.stringify({
    challengeId: challengeId,
    code: '123456' // Dev mode OTP
  });

  const otpOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/verify-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(otpData)
    }
  };

  const otpReq = http.request(otpOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('OTP verify response:', data);
      try {
        const otpResult = JSON.parse(data);
        if (otpResult.accessToken) {
          // Test SMS sending
          testSmsSend(otpResult.accessToken);
        }
      } catch (e) {
        console.error('Error parsing OTP response:', e);
      }
    });
  });

  otpReq.on('error', (e) => {
    console.error('OTP verify error:', e);
  });

  otpReq.write(otpData);
  otpReq.end();
}

function testSmsSend(accessToken) {
  const smsData = JSON.stringify({
    recipient: '09145052346',
    message: 'Test SMS from portal'
  });

  const smsOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/sms/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Length': Buffer.byteLength(smsData)
    }
  };

  const smsReq = http.request(smsOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('SMS send response:', data);
      console.log('Status code:', res.statusCode);
    });
  });

  smsReq.on('error', (e) => {
    console.error('SMS send error:', e);
  });

  smsReq.write(smsData);
  smsReq.end();
}
