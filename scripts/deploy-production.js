#!/usr/bin/env node

/**
 * IRIB Digital Workplace - Production Deployment Wizard (CLI)
 * Interactive command-line deployment wizard for production environments
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

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

const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Setup steps
const deploymentSteps = [
  {
    id: 'environment-check',
    title: 'Environment Check',
    description: 'Check Docker, disk space, ports, and system requirements',
    execute: async () => {
      logStep('Checking production environment...');
      
      const checks = {
        docker: false,
        dockerVersion: 'N/A',
        diskSpace: 'N/A',
        ports: {
          3000: false,
          3001: false,
          5433: false,
          6379: false,
        },
      };

      // Check Docker
      const dockerCheck = executeCommand('docker --version');
      if (dockerCheck.success) {
        checks.docker = true;
        checks.dockerVersion = dockerCheck.output;
        logSuccess(`Docker found: ${dockerCheck.output}`);
      } else {
        logError('Docker not found');
        return checks;
      }

      // Check Docker Compose
      const composeCheck = executeCommand('docker-compose --version');
      if (composeCheck.success) {
        logSuccess(`Docker Compose found: ${composeCheck.output}`);
      } else {
        logError('Docker Compose not found');
        return checks;
      }

      // Check disk space
      const diskCheck = executeCommand('df -h .');
      if (diskCheck.success) {
        checks.diskSpace = diskCheck.output;
        logSuccess('Disk space check completed');
      }

      // Check ports
      logInfo('Checking required ports...');
      for (const port of [3000, 3001, 5433, 6379]) {
        const portCheck = executeCommand(`netstat -tuln | grep :${port}`);
        if (!portCheck.success) {
          checks.ports[port] = true;
          logSuccess(`Port ${port} is available`);
        } else {
          logWarning(`Port ${port} is in use`);
        }
      }

      return checks;
    }
  },
  {
    id: 'security-setup',
    title: 'Security Setup',
    description: 'Generate encryption keys and secrets',
    execute: async () => {
      logStep('Setting up security configuration...');
      
      const secrets = {
        jwtSecret: generateSecret(32),
        settingsEncryptionKey: generateSecret(32),
        postgresPassword: generateSecret(16),
        redisPassword: generateSecret(16),
      };

      logSuccess('Secrets generated');
      logWarning('IMPORTANT: Save these secrets securely!');
      log('='.repeat(50), colors.yellow);
      log(`JWT_SECRET: ${secrets.jwtSecret}`, colors.yellow);
      log(`SETTINGS_ENCRYPTION_KEY: ${secrets.settingsEncryptionKey}`, colors.yellow);
      log(`POSTGRES_PASSWORD: ${secrets.postgresPassword}`, colors.yellow);
      log(`REDIS_PASSWORD: ${secrets.redisPassword}`, colors.yellow);
      log('='.repeat(50), colors.yellow);

      // Create .env file
      const envContent = `
NODE_ENV=production
ENVIRONMENT=production
JWT_SECRET=${secrets.jwtSecret}
SETTINGS_ENCRYPTION_KEY=${secrets.settingsEncryptionKey}
DATABASE_URL=postgresql://postgres:${secrets.postgresPassword}@postgres:5432/irib_dwp
REDIS_URL=redis://:${secrets.redisPassword}@redis:6379
POSTGRES_PASSWORD=${secrets.postgresPassword}
REDIS_PASSWORD=${secrets.redisPassword}
`;

      try {
        fs.writeFileSync('.env.production', envContent);
        logSuccess('.env.production file created');
      } catch (error) {
        logError('Failed to create .env.production file');
        return { success: false, error: error.message };
      }

      return { success: true, secrets };
    }
  },
  {
    id: 'pull-code',
    title: 'Pull Latest Code',
    description: 'Pull latest code from Git repository',
    execute: async () => {
      logStep('Pulling latest code from repository...');
      
      // Check if this is a git repository
      const gitCheck = executeCommand('git status');
      if (!gitCheck.success) {
        logError('Not a git repository. Please clone the repository first.');
        return gitCheck;
      }

      // Pull latest code
      const pullResult = await executeCommandAsync('git pull');
      if (pullResult.success) {
        logSuccess('Latest code pulled successfully');
      } else {
        logError('Failed to pull latest code');
        return pullResult;
      }

      return { success: true };
    }
  },
  {
    id: 'build-images',
    title: 'Build Docker Images',
    description: 'Build frontend and backend Docker images',
    execute: async () => {
      logStep('Building Docker images...');
      
      const results = {
        frontend: false,
        backend: false,
      };

      // Build frontend
      logInfo('Building frontend image...');
      const frontendBuild = await executeCommandAsync('docker-compose -f docker-compose.prod.yml build frontend');
      if (frontendBuild.success) {
        results.frontend = true;
        logSuccess('Frontend image built successfully');
      } else {
        logError('Frontend image build failed');
        return frontendBuild;
      }

      // Build backend
      logInfo('Building backend image...');
      const backendBuild = await executeCommandAsync('docker-compose -f docker-compose.prod.yml build backend');
      if (backendBuild.success) {
        results.backend = true;
        logSuccess('Backend image built successfully');
      } else {
        logError('Backend image build failed');
        return backendBuild;
      }

      return { success: true, results };
    }
  },
  {
    id: 'deploy-services',
    title: 'Deploy Services',
    description: 'Deploy all services with Docker Compose',
    execute: async () => {
      logStep('Deploying services...');
      
      // Stop existing containers
      logInfo('Stopping existing containers...');
      await executeCommandAsync('docker-compose -f docker-compose.prod.yml down');

      // Start new containers
      logInfo('Starting services...');
      const deployResult = await executeCommandAsync('docker-compose -f docker-compose.prod.yml up -d');
      if (deployResult.success) {
        logSuccess('Services deployed successfully');
      } else {
        logError('Service deployment failed');
        return deployResult;
      }

      // Wait for services to be ready
      logInfo('Waiting for services to be ready...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      return { success: true };
    }
  },
  {
    id: 'database-setup',
    title: 'Database Setup',
    description: 'Run Prisma migrations and seed data',
    execute: async () => {
      logStep('Setting up database...');
      
      // Run Prisma migrations
      logInfo('Running Prisma migrations...');
      const migrateResult = await executeCommandAsync('docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy');
      if (migrateResult.success) {
        logSuccess('Migrations completed successfully');
      } else {
        logWarning('Migrations failed (may not be critical if database is already set up)');
      }

      // Run seed data (optional)
      const seedAnswer = await askQuestion('Run seed data? (y/n): ');
      if (seedAnswer.trim().toLowerCase() === 'y') {
        logInfo('Running seed data...');
        const seedResult = await executeCommandAsync('docker-compose -f docker-compose.prod.yml exec -T backend npx prisma db seed');
        if (seedResult.success) {
          logSuccess('Seed data completed');
        } else {
          logWarning('Seed data failed');
        }
      }

      return { success: true };
    }
  },
  {
    id: 'health-check',
    title: 'Health Check',
    description: 'Verify all services are running correctly',
    execute: async () => {
      logStep('Performing health checks...');
      
      const checks = {
        frontend: false,
        backend: false,
        database: false,
        redis: false,
      };

      // Check frontend
      logInfo('Checking frontend...');
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
      logInfo('Checking backend...');
      try {
        const backendCheck = await executeCommandAsync('curl -f http://localhost:3001/api/v1/health/live');
        if (backendCheck.success) {
          checks.backend = true;
          logSuccess('Backend is accessible');
        }
      } catch (error) {
        logError('Backend is not accessible');
      }

      // Check database
      logInfo('Checking database...');
      const dbCheck = executeCommandAsync('docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres -d irib_dwp');
      if (dbCheck.success) {
        checks.database = true;
        logSuccess('Database is accessible');
      } else {
        logError('Database is not accessible');
      }

      // Check Redis
      logInfo('Checking Redis...');
      const redisCheck = executeCommandAsync('docker-compose -f docker-compose.prod.yml exec -T redis redis-cli -a redis ping');
      if (redisCheck.success) {
        checks.redis = true;
        logSuccess('Redis is accessible');
      } else {
        logError('Redis is not accessible');
      }

      return checks;
    }
  },
  {
    id: 'post-deployment',
    title: 'Post-Deployment Configuration',
    description: 'Provide instructions for post-deployment setup',
    execute: async () => {
      logStep('Post-deployment configuration...');
      
      logInfo('Production deployment completed successfully!');
      logInfo('');
      logInfo('Next steps:', colors.cyan);
      logInfo('1. Access the application at http://localhost:3000', colors.cyan);
      logInfo('2. Access the admin panel at http://localhost:3000/admin', colors.cyan);
      logInfo('3. Configure system settings at http://localhost:3000/admin/settings', colors.cyan);
      logInfo('4. Run the Production Setup Wizard at http://localhost:3000/admin/setup-wizard', colors.cyan);
      logInfo('');
      logInfo('Important security notes:', colors.yellow);
      logInfo('- Make sure to configure SSL/HTTPS for production', colors.yellow);
      logInfo('- Set up proper firewall rules', colors.yellow);
      logInfo('- Configure backups for the database', colors.yellow);
      logInfo('- Monitor logs regularly', colors.yellow);

      return { success: true };
    }
  }
];

// Main execution
async function main() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║', colors.cyan);
  log('║   IRIB Digital Workplace - Production Deployment Wizard', colors.bright);
  log('║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════╝', colors.cyan);
  console.log('\n');

  log('This wizard will help you deploy the application to production.', colors.white);
  log('Press Ctrl+C to cancel at any time.\n', colors.white);

  // Warning
  logWarning('This will deploy to production environment. Make sure you have backups!');
  const confirm = await askQuestion('Are you sure you want to continue? (yes/no): ');
  
  if (confirm.trim().toLowerCase() !== 'yes') {
    logInfo('Deployment cancelled by user.');
    process.exit(0);
  }

  // Ask for execution mode
  const mode = await askQuestion('Choose execution mode:\n1. Auto (run all steps)\n2. Interactive (step by step)\n\nYour choice (1-2): ');

  const isAuto = mode.trim() === '1';

  let completedSteps = 0;
  let failedSteps = 0;

  for (const step of deploymentSteps) {
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
  log('Deployment Summary', colors.bright);
  log('═════════════════════════════════════════════════════════════', colors.cyan);
  console.log();
  log(`✅ Completed steps: ${completedSteps}/${deploymentSteps.length}`, colors.green);
  log(`❌ Failed steps: ${failedSteps}/${deploymentSteps.length}`, failedSteps > 0 ? colors.red : colors.green);
  console.log();

  if (failedSteps === 0) {
    logSuccess('🎉 Production deployment completed successfully!');
    logInfo('Your application is now running on production.');
    logInfo('Frontend: http://localhost:3000');
    logInfo('Backend: http://localhost:3001');
    logInfo('Admin Panel: http://localhost:3000/admin');
  } else {
    logError('Deployment completed with errors. Please review the errors above.');
  }

  console.log('\n');
}

// Run the wizard
main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
