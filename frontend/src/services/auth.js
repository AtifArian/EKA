import api from './api';

// Generate device fingerprint
const getDeviceFingerprint = () => {
  const nav = navigator;
  const screen = window.screen;
  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || 'unknown',
    nav.platform
  ].join('|');
  return fingerprint;
};

export const signup = async (userData, verificationFile = null) => {
  console.log('\n=== SIGNUP API CALL ===');
  console.log('User data:', userData);
  console.log('Verification file:', verificationFile ? verificationFile.name : 'None');
  
  // If doctor signup with file, send as FormData
  if (userData.is_doctor && verificationFile) {
    console.log('Sending as FormData (doctor with file)...');
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('full_name', userData.full_name || '');
    formData.append('is_doctor', 'true');
    formData.append('verification_document', verificationFile);
    
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0], ':', pair[1] instanceof File ? pair[1].name : pair[1]);
    }
    
    const response = await api.post('/auth/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('✓ Doctor signup response:', response.data);
    return response.data;
  }
  
  // Regular signup without file
  console.log('Sending as JSON (regular user)...');
  const response = await api.post('/auth/signup', userData);
  console.log('✓ Signup response:', response.data);
  return response.data;
};

export const login = async (credentials) => {
  // Add device fingerprint to credentials
  const deviceFingerprint = getDeviceFingerprint();
  console.log('Device fingerprint generated:', deviceFingerprint.substring(0, 50) + '...');
  
  const loginData = {
    ...credentials,
    device_fingerprint: deviceFingerprint
  };
  
  console.log('Sending login request...');
  const response = await api.post('/auth/login', loginData);
  console.log('Login API response:', response.data);
  
  return response.data;
};

export const verifyOTP = async (otpData, tempToken) => {
  const response = await api.post('/auth/verify-otp', otpData, {
    headers: {
      'Authorization': `Bearer ${tempToken}`
    }
  });
  return response.data;
};

export const googleAuth = async (token) => {
  const response = await api.post('/auth/google', { token });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const verifyDoctor = async (file) => {
  const formData = new FormData();
  formData.append('verification_document', file);
  
  const response = await api.post('/auth/verify-doctor', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
