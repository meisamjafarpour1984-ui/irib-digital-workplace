#!/usr/bin/env node

/**
 * IRIB Digital Workplace - Local Development Setup Wizard (CLI)
 * Interactive command-line setup wizard for local development
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Utility functions
const log = (message, color = colors.white) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logError = (message) => log(`❌ ${message}`, colors.red);
const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logWarning = (message) => log(`⚠️  ${message}`, colors.yellow);
const logInfo = (message) => log(`ℹ️  ${message}`, colors.cyan);
const logStep = (message) => log(`📋 ${message}`, colors.bright);

const executeCommand = (command, cwd = process.cwd()) => {
  try {
    const output = execSync(command, { 
      cwd, 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout ? error.stdout.trim() : ''
    };
  }
};

const executeCommandAsync = (command, cwd = process.cwd()) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [], { 
      cwd, 
      shell: true,
      stdio: 'pipe'
    });

    let output = '';
    let error = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      error += data.toString();
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: output.trim() });
      } else {
        resolve({ 
          success: false, 
          error: error || `Command failed with code ${code}`,
          output: output.trim()
        });
      }
    });

    child.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
};

const askQuestion = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Setup steps
const setupSteps = [
  {
    id: 'environment-check',
    title: 'Environment Check',
    description: 'Check Node.js, npm, Docker, Git, and ports',
    execute: async () => {
      logStep('Checking development environment...');
      
      const checks = {
        node: false,
        nodeVersion: 'N/A',
        npm: false,
        npmVersion: 'N/A',
        docker: false,
        dockerVersion: 'N/A',
        git: false,
        gitVersion: 'N/A',
      };

      // Check Node.js
      const nodeCheck = executeCommand('node --version');
      if (nodeCheck.success) {
        checks.node = true;
        checks.nodeVersion = nodeCheck.output;
        logSuccess(`Node.js found: ${nodeCheck.output}`);
      } else {
        logError('Node.js not found');
      }

      // Check npm
      const npmCheck = executeCommand('npm --version');
      if (npmCheck.success) {
        checks.npm = true;
        checks.npmVersion = npmCheck.output;
        logSuccess(`npm found: ${npmCheck.output}`);
      } else {
        logError('npm not found');
      }

      // Check Docker
      const dockerCheck = executeCommand('docker --version');
      if (dockerCheck.success) {
        checks.docker = true;
        checks.dockerVersion = dockerCheck.output;
        logSuccess(`Docker found: ${dockerCheck.output}`);
      } else {
        logError('Docker not found');
      }

      // Check Git
      const gitCheck = executeCommand('git --version');
      if (gitCheck.success) {
        checks.git = true;
        checks.gitVersion = gitCheck.output;
        logSuccess(`Git found: ${gitCheck.output}`);
      } else {
        logError('Git not found');
      }

      return checks;
    }
  },
  {
    id: 'install-dependencies',
    title: 'Install Dependencies',
    description: 'Install frontend and backend dependencies',
    execute: async () => {
      logStep('Installing dependencies...');
      
      // Install frontend dependencies
      logInfo('Installing frontend dependencies...');
      const frontendInstall = await executeCommandAsync('npm install');
      if (frontendInstall.success) {
        logSuccess('Frontend dependencies installed');
      } else {
        logError('Frontend dependencies installation failed');
        return frontendInstall;
      }

      // Install backend dependencies
      logInfo('Installing backend dependencies...');
      const backendInstall = await executeCommandAsync('npm install', path.join(process.cwd(), 'backend'));
      if (backendInstall.success) {
        logSuccess('Backend dependencies installed');
      } else {
        logError('Backend dependencies installation failed');
        return backendInstall;
      }

      return { success: true };
    }
  },
  {
    id: 'docker-setup',
    title: 'Docker Setup',
    description: 'Start Docker services (PostgreSQL, Redis)',
    execute: async () => {
      logStep('Setting up Docker services...');
      
      // Check if Docker is running
      const dockerPs = executeCommand('docker ps');
      if (!dockerPs.success) {
        logError('Docker is not running');
        return dockerPs;
      }

      logSuccess('Docker is running');

      // Start Docker Compose services
      logInfo('Starting Docker Compose services...');
      const dockerCompose = await executeCommandAsync('docker-compose up -d');
      if (dockerCompose.success) {
        logSuccess('Docker services started');
      } else {
        logError('Docker services failed to start');
        return dockerCompose;
      }

      // Wait for services to be ready
      logInfo('Waiting for services to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      return { success: true };
    }
  },
  {
    id: 'database-setup',
    title: 'Database Setup',
    description: 'Run Prisma migrations and seed data',
    execute: async () => {
      logStep('Setting up database...');
      
      const backendPath = path.join(process.cwd(), 'backend');

      // Run Prisma migrations
      logInfo('Running Prisma migrations...');
      const migrate = await executeCommandAsync('npx prisma migrate dev', backendPath);
      if (migrate.success) {
        logSuccess('Migrations completed');
      } else {
        logError('Migrations failed');
        return migrate;
      }

      // Run seed data
      logInfo('Running seed data...');
      const seed = await executeCommandAsync('npx prisma db seed', backendPath);
      if (seed.success) {
        logSuccess('Seed data completed');
      } else {
        logWarning('Seed data failed (may not be critical)');
      }

      return { success: true };
    }
  },
  {
    id: 'start-servers',
    title: 'Start Development Servers',
    description: 'Start frontend and backend development servers',
    execute: async () => {
      logStep('Starting development servers...');
      
      logInfo('Starting backend server...');
      const backendPath = path.join(process.cwd(), 'backend');
      
      // Start backend in background
      const backendProcess = spawn('npm', ['run', 'start:dev'], {
        cwd: backendPath,
        detached: true,
        stdio: 'ignore'
      });
      backendProcess.unref();
      
      logSuccess('Backend server started on http://localhost:3001');

      // Wait for backend to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));

      logInfo('Starting frontend server...');
      
      // Start frontend in background
      const frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore'
      });
      frontendProcess.unref();
      
      logSuccess('Frontend server started on http://localhost:3000');

      return { 
        success: true,
        frontend: 'http://localhost:3000',
        backend: 'http://localhost:3001'
      };
    }
  },
  {
    id: 'verify',
    title: 'Verify Setup',
    description: 'Verify that all services are running correctly',
    execute: async () => {
      logStep('Verifying setup...');
      
      const checks = {
        frontend: false,
        backend: false,
        database: false,
      };

      // Check frontend
      try {
        const frontendCheck = await executeCommandAsync('curl -f http://localhost:3000');
        if (frontendCheck.success) {
          checks.frontend = true;
          logSuccess('Frontend is accessible');
        }
      } catch (error) {
        logError('Frontend is not accessible');
      }

      // Check backend
      try {
        const backendCheck = await executeCommandAsync('curl -f http://localhost:3001/health');
        if (backendCheck.success) {
          checks.backend = true;
          logSuccess('Backend is accessible');
        }
      } catch (error) {
        logError('Backend is not accessible');
      }

      // Check database
      const dbCheck = executeCommand('npx prisma db push --skip-generate', path.join(process.cwd(), 'backend'));
      if (dbCheck.success) {
        checks.database = true;
        logSuccess('Database is accessible');
      } else {
        logError('Database is not accessible');
      }

      return checks;
    }
  }
];

// Main execution
async function main() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║', colors.cyan);
  log('║   IRIB Digital Workplace - Local Development Setup Wizard', colors.bright);
  log('║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════╝', colors.cyan);
  console.log('\n');

  log('This wizard will help you set up the local development environment.', colors.white);
  log('Press Ctrl+C to cancel at any time.\n', colors.white);

  // Ask for execution mode
  const mode = await askQuestion('Choose execution mode:\n1. Auto (run all steps)\n2. Interactive (step by step)\n\nYour choice (1-2): ');

  const isAuto = mode.trim() === '1';

  let completedSteps = 0;
  let failedSteps = 0;

  for (const step of setupSteps) {
    console.log('\n');
    logStep(`Step: ${step.title}`);
    log(`Description: ${step.description}`, colors.white);
    console.log();

    if (!isAuto) {
      const confirm = await askQuestion('Press Enter to continue, or type "skip" to skip this step: ');
      if (confirm.trim().toLowerCase() === 'skip') {
        logWarning('Step skipped');
        continue;
      }
    }

    try {
      const result = await step.execute();
      
      if (result.success) {
        completedSteps++;
        logSuccess(`Step "${step.title}" completed`);
      } else {
        failedSteps++;
        logError(`Step "${step.title}" failed: ${result.error}`);
        
        if (!isAuto) {
          const retry = await askQuestion('Press Enter to continue, or type "retry" to retry: ');
          if (retry.trim().toLowerCase() === 'retry') {
            logInfo('Retrying step...');
            const retryResult = await step.execute();
            if (retryResult.success) {
              completedSteps++;
              failedSteps--;
              logSuccess(`Step "${step.title}" completed on retry`);
            } else {
              logError(`Step "${step.title}" failed again`);
            }
          }
        }
      }
    } catch (error) {
      failedSteps++;
      logError(`Step "${step.title}" encountered an error: ${error.message}`);
    }
  }

  // Summary
  console.log('\n');
  log('═════════════════════════════════════════════════════════════', colors.cyan);
  log('Setup Summary', colors.bright);
  log('═════════════════════════════════════════════════════════════', colors.cyan);
  console.log();
  log(`✅ Completed steps: ${completedSteps}/${setupSteps.length}`, colors.green);
  log(`❌ Failed steps: ${failedSteps}/${setupSteps.length}`, failedSteps > 0 ? colors.red : colors.green);
  console.log();

  if (failedSteps === 0) {
    logSuccess('🎉 Setup completed successfully!');
    logInfo('Your development environment is ready.');
    logInfo('Frontend: http://localhost:3000');
    logInfo('Backend: http://localhost:3001');
    logInfo('Setup Wizard: http://localhost:3000/admin/local-dev-setup-wizard');
  } else {
    logError('Setup completed with errors. Please review the errors above.');
  }

  console.log('\n');
}

// Run the wizard
main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
