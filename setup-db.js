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
    // Delete existing migrations folder if it exists
    const migrationsPath = path.join(__dirname, 'prisma', 'migrations');
    if (fs.existsSync(migrationsPath)) {
      console.log('Removing existing migrations...');
      fs.rmSync(migrationsPath, { recursive: true, force: true });
    }

    // Create new initial migration
    console.log('Creating new migration...');
    await runCommand('npx prisma migrate dev --name init --create-only');

    // Generate Prisma client
    console.log('Generating Prisma client...');
    await runCommand('npx prisma generate');

    // Apply migrations to the database
    console.log('Applying migrations...');
    await runCommand('npx prisma migrate deploy');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Failed to set up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 