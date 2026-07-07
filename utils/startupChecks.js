export function assertEnv(requiredKeys = []) {
  const missing = [];
  for (const key of requiredKeys) {
    const val = process.env[key];
    if (val === undefined || val === '') missing.push(key);
  }
  return missing;
}

function looksLikeHex(str) {
  if (!str) return false;
  // allow even-length hex strings only
  return /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;
}

export function printStartupDiagnostics() {
  const required = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'ENCRYPTION_KEY',
    'FRONTEND_URL',
    'APP_ID',
    'APP_SECRET',
    'FACEBOOK_REDIRECT_URI',
  ];

  const missing = assertEnv(required);

  console.log('========== Backend Startup Diagnostics ==========');
  if (missing.length) {
    console.error('Missing environment variables:', missing.join(', '));
  } else {
    console.log('Environment variables: OK');
  }

  const encryptionKeyOk = process.env.ENCRYPTION_KEY
    ? looksLikeHex(process.env.ENCRYPTION_KEY)
    : false;

  if (!encryptionKeyOk) {
    console.error(
      'ENCRYPTION_KEY does not look like a hex string (expected Buffer.from(ENCRYPTION_KEY, "hex")).'
    );
  }

  console.log(
    `Will bind to PORT=${process.env.PORT || 5000} (set PORT to override).`
  );
  console.log('================================================');
}

