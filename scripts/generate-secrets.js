#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// List of secret keys to generate
const SECRET_KEYS = [
  'SECRET',
  'JWT_SECRET',
  'SESSION_SECRET',
  'API_SECRET',
  'AUTH_SECRET',
  // Add more as needed
];

// Helper to generate a secure random string
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Find all .env and .env.* files (excluding .env.example)
function findEnvFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(findEnvFiles(fullPath));
    } else if (
      f.startsWith('.env') &&
      f !== '.env.example' &&
      fs.statSync(fullPath).isFile()
    ) {
      results.push(fullPath);
    }
  });
  return results;
}

// Update or insert secrets in a given .env file
function updateEnvFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  SECRET_KEYS.forEach(key => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      // If key exists but is empty, fill it
      content = content.replace(regex, line => {
        if (line.trim() === `${key}=`) {
          changed = true;
          return `${key}=${generateSecret(32)}`;
        }
        return line;
      });
    } else {
      // If key is missing, add it
      content += `\n${key}=${generateSecret(32)}`;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated secrets in: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Main
const rootDir = process.cwd();
const envFiles = findEnvFiles(rootDir);

if (envFiles.length === 0) {
  console.log('No .env files found.');
  process.exit(0);
}

envFiles.forEach(file => updateEnvFile(file));

console.log('Secret token generation complete.');