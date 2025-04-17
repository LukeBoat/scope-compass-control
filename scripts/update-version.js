import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the current git commit hash
const gitCommit = execSync('git rev-parse HEAD').toString().trim();

// Get the current date
const buildDate = new Date().toISOString();

// Read the package.json to get the version
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

// Create the version file content
const versionFileContent = `// This file is automatically updated during the build process
export const APP_VERSION = '${version}';
export const BUILD_DATE = '${buildDate}';
export const GIT_COMMIT = '${gitCommit}';
`;

// Write the version file
fs.writeFileSync(path.join(__dirname, '../src/config/version.ts'), versionFileContent);

console.log('Version file updated successfully!'); 