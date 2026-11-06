import { execSync } from 'child_process';

const PORT = process.env.PORT || 4000;
console.log(`Stopping any background Backwoods Wiki server on port ${PORT}...`);

if (process.platform === 'win32') {
  try {
    const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    const lines = output.split('\n').filter(Boolean);
    const pids = new Set();
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`);
        console.log(`[OK] Terminated Backwoods Wiki process on PID ${pid}`);
      } catch {}
    }
  } catch {
    console.log(`[Notice] No active process was found listening on port ${PORT}.`);
  }
} else {
  try {
    execSync(`fuser -k ${PORT}/tcp`);
    console.log(`[OK] Terminated process on port ${PORT}`);
  } catch {}
}

console.log('Backwoods Wiki background server stopped.');
