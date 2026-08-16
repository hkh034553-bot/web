const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const accounts = [
  { email: 'hf.alihasan0@gmail.com', password: 'ebd80db143a1d87e' },
  { email: '0alihasanfarooqui0@gmail.com', password: '7531ae658c9cacc5' },
  { email: 'hasanshahirconnect@gmail.com', password: 'e7d4ff60761143fb' }
];

async function testLogins() {
  console.log("Testing Admin Logins...\n");
  let successCount = 0;

  for (const acc of accounts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password,
    });
    
    if (error) {
      console.log(`❌ Failed: ${acc.email} - ${error.message}`);
    } else {
      console.log(`✅ Success: ${acc.email}`);
      
      // Also verify they are in the admin_users table
      const { data: adminCheck, error: rpcError } = await supabase.rpc('is_admin');
      if (adminCheck) {
        console.log(`   ↳ Admin privileges verified!`);
        successCount++;
      } else {
        console.log(`   ↳ ERROR: Logged in, but NOT an admin!`);
      }
    }
  }

  console.log(`\nResults: ${successCount}/${accounts.length} admin accounts are fully functional.`);
}

testLogins();
