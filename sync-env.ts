import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env');
const targetPath = join(process.cwd(), 'env-injection.js');

try {
    const envContent = readFileSync(envPath, 'utf-8');
    const ninjaKeyMatch = envContent.match(/NINJA_API_KEY=(.*)/);

    if (ninjaKeyMatch && ninjaKeyMatch[1]) {
        const key = ninjaKeyMatch[1].trim();
        const jsContent = `window.process = { env: { NINJA_API_KEY: '${key}', API_KEY: '${key}' } };\nconsole.log('Environment variables injected');`;

        writeFileSync(targetPath, jsContent);
        console.log('Successfully generated env-injection.js from .env');
    } else {
        console.error('NINJA_API_KEY not found in .env');
    }
} catch (err) {
    console.error('Error generating env-injection.js:', err);
}
