const { execSync } = require('child_process');
try {
  execSync('npx vitest run --reporter=basic', { encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  const lines = e.stdout.split('\n');
  const failures = lines.filter(l => l.includes('FAIL') || l.includes('Error') || l.includes('fail'));
  console.log(failures.join('\n'));
}
