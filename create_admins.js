const crypto = require('crypto');
const fs = require('fs');

const env = fs.readFileSync('d:\\vibes\\hkh\\hasan cop[y\\digivolve\\.env.local', 'utf-8');
const envVars = {};
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const emails = [
  'hf.alihasan0@gmail.com',
  '0alihasanfarooqui0@gmail.com',
  'hasanshahirconnect@gmail.com',
  'hkh034553@gmail.com'
];

function generatePassword() {
  return crypto.randomBytes(8).toString('hex'); // 16 chars
}

async function run() {
  const results = [];
  
  for (const email of emails) {
    const password = generatePassword();
    
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.msg && (data.msg.includes('already registered') || data.msg.includes('User already registered'))) {
           results.push({ email, password: 'ALREADY_EXISTS', id: null });
        } else {
           console.error(`Error for ${email}:`, data.msg || data.message || JSON.stringify(data));
        }
      } else {
        results.push({ email, password, id: data.id || data.user?.id });
      }
    } catch (e) {
      console.error(`Fetch error for ${email}:`, e);
    }
  }

  console.log("=== RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
}

run();
