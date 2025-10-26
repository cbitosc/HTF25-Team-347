// Script to create demo accounts in Supabase
// Run with: node scripts/create-demo-accounts.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

// Handle both Windows (\r\n) and Unix (\n) line endings
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const demoAccounts = [
  {
    email: 'nikhil@demo.com',
    password: 'demo123',
    name: 'Nikhil',
    role: 'citizen'
  },
  {
    email: 'manideep@demo.com',
    password: 'demo123',
    name: 'Manideep',
    role: 'collector'
  },
  {
    email: 'badrinath@demo.com',
    password: 'demo123',
    name: 'Badrinath',
    role: 'ngo'
  },
  {
    email: 'srishant@demo.com',
    password: 'demo123',
    name: 'Srishant Goutham',
    role: 'admin'
  }
];

async function createDemoAccounts() {
  console.log('Creating demo accounts...\n');

  for (const account of demoAccounts) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true, // Auto-confirm email
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`✓ ${account.name} (${account.role}) - already exists`);
          
          // Get existing user ID
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users.users.find(u => u.email === account.email);
          
          if (existingUser) {
            // Update profile
            const { error: profileError } = await supabase
              .from('users')
              .upsert({
                id: existingUser.id,
                email: account.email,
                name: account.name,
                role: account.role,
              });

            if (profileError) {
              console.error(`  Error updating profile: ${profileError.message}`);
            }
          }
        } else {
          throw authError;
        }
        continue;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: account.email,
          name: account.name,
          role: account.role,
        });

      if (profileError) {
        console.error(`✗ ${account.name} - Profile creation failed: ${profileError.message}`);
      } else {
        console.log(`✓ ${account.name} (${account.role}) - created successfully`);
      }

    } catch (error) {
      console.error(`✗ ${account.name} - Error: ${error.message}`);
    }
  }

  // Create initial demo data
  console.log('\nCreating initial demo data...');
  
  // Get Nikhil's user ID
  const { data: nikhilUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'nikhil@demo.com')
    .single();

  if (nikhilUser) {
    // Create a sample pickup
    const { error: pickupError } = await supabase
      .from('pickups')
      .upsert({
        user_id: nikhilUser.id,
        waste_type: 'Plastic',
        weight: 5.0,
        status: 'pending',
        pickup_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        address: '123 Main Street, Downtown',
        notes: 'Please collect from main gate',
      });

    if (!pickupError) {
      console.log('✓ Sample pickup created');
    }
  }

  console.log('\nDemo accounts setup complete!');
  console.log('\nYou can now sign in with:');
  console.log('- nikhil@demo.com / demo123 (Citizen)');
  console.log('- manideep@demo.com / demo123 (Collector)');
  console.log('- badrinath@demo.com / demo123 (NGO)');
  console.log('- srishant@demo.com / demo123 (Admin)');
}

createDemoAccounts().catch(console.error);
