import { spawn } from 'child_process';

async function run() {
  console.log('Spawning Vite preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], {
    stdio: 'pipe'
  });

  server.stdout.on('data', (data) => {
    console.log('Server stdout:', data.toString().trim());
  });

  server.stderr.on('data', (data) => {
    console.error('Server stderr:', data.toString().trim());
  });

  // Wait 3 seconds for server to boot
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    console.log('Fetching http://127.0.0.1:4173/...');
    const res = await fetch('http://127.0.0.1:4173/');
    console.log('Response Status:', res.status);
    const html = await res.text();
    console.log('HTML snippet (first 200 chars):', html.slice(0, 200));
  } catch (err) {
    console.error('Error fetching preview server:', err);
  } finally {
    console.log('Killing Vite preview server gracefully...');
    server.kill('SIGTERM');
  }
}

run();
