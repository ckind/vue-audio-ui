// todo: could probably just do this all in node
import { execSync } from 'child_process';

if (process.platform === 'win32') {
  execSync('cmd /c scripts/publish-local.cmd', { stdio: 'inherit' });
} else {
  execSync('bash ./scripts/publish-local.sh', { stdio: 'inherit' });
}