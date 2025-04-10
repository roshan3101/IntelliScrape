const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function setupDatabase() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('ERROR: DATABASE_URL environment variable is not set!');
      console.error('Please set the DATABASE_URL environment variable in your Vercel project settings.');
      process.exit(1);
    }

    console.log('Using database URL:', process.env.DATABASE_URL.replace(/:.+@/, ':****@')); // Hide password in logs

    // Delete existing migrations folder if it exists
    const migrationsPath = path.join(__dirname, 'prisma', 'migrations');
    if (fs.existsSync(migrationsPath)) {
      console.log('Removing existing migrations...');
      fs.rmSync(migrationsPath, { recursive: true, force: true });
    }

    // Generate Prisma client
    console.log('Generating Prisma client...');
    await runCommand('npx prisma generate');

    // Push schema to database (non-interactive)
    console.log('Pushing schema to database...');
    await runCommand('npx prisma db push --accept-data-loss --force-reset');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Failed to set up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 