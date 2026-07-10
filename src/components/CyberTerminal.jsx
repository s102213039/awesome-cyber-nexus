import React, { useState, useEffect, useRef } from 'react';
import soundManager from '../utils/SoundManager';

const WELCOME_MESSAGE = [
  '==================================================',
  'CYBER-NEXUS SECURITY OPERATION COGNITIVE CORES v4.20',
  'AUTHENTICATION STATUS: ACTIVE OPERATOR (SESSION #901)',
  'TYPE "help" TO DISCOVER COGNITIVE COMMAND SUBROUTINES',
  '==================================================',
  ''
];

const CANDIDATES = ['CRYPTO', 'TROJAN', 'MATRIX', 'FIREWALL', 'KRNL32', 'CYBERNET', 'SENTINEL', 'DECRYPT'];

export default function CyberTerminal() {
  const [history, setHistory] = useState([...WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [matrixActive, setMatrixActive] = useState(false);
  const [hackState, setHackState] = useState(null); // { secret: '', tries: 4 }
  const terminalEndRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Cleanup scan interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    const container = terminalEndRef.current?.parentElement?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [history]);

  // Matrix falling letters canvas effect
  useEffect(() => {
    if (!matrixActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const columns = Math.floor(canvas.width / 14);
    const drops = Array(columns).fill(1);
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ☠☣⚙⚛⚡';
    
    // Theme color resolver
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00f0ff';

    let interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = primaryColor;
      ctx.font = '12px "Share Tech Mono", monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 14, drops[i] * 14);

        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      
      if (Math.random() < 0.15) {
        soundManager.playMatrix();
      }
    }, 45);

    const handleResize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [matrixActive]);

  const addLine = (line) => {
    setHistory(prev => [...prev, line]);
  };

  const handleCommand = (cmdStr) => {
    const args = cmdStr.trim().split(' ');
    const command = args[0].toLowerCase();
    
    soundManager.playClick();
    addLine(`op@cyber-nexus:~# ${cmdStr}`);

    if (matrixActive) {
      if (command === 'exit' || command === 'matrix' || command === 'q') {
        setMatrixActive(false);
        addLine('MATRIX RAIN CONCLUDED. SCREEN RESTORED.');
      } else {
        addLine('TERMINAL LOCKED IN CORE STREAM. PRESS "exit" TO RESTORE HUD.');
      }
      setInputValue('');
      return;
    }

    if (hackState) {
      const lowerCmd = cmdStr.trim().toLowerCase();
      if (lowerCmd === 'exit' || lowerCmd === 'quit') {
        setHackState(null);
        addLine('DECRYPTION TERMINATED. CORE RESTORED.');
      } else {
        handleHackGuess(cmdStr.trim().toUpperCase());
      }
      setInputValue('');
      return;
    }

    switch (command) {
      case 'help':
        addLine('Available Systems:');
        addLine('  scan [ip]   - Trace network nodes & assess vulnerability vectors.');
        addLine('  decrypt     - Initialize mainframe password decryption challenge.');
        addLine('  system      - Display firewall modules & cognitive mainframe loads.');
        addLine('  logs        - Intercept core firewall real-time intrusion warnings.');
        addLine('  matrix      - Engage fallback digital cascade screensaver (exit: "q").');
        addLine('  clear       - Purge terminal terminal history buffer.');
        addLine('  help        - Display this menu module.');
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'system':
        addLine('--- COGNITIVE NEXUS SYSTEM STATUS ---');
        addLine(`MAINFRAME STATUS: STABLE`);
        addLine(`FIREWALL INTEGRITY: 94.2%`);
        addLine(`COGNITIVE LOAD: ${Math.floor(Math.random() * 20) + 15}%`);
        addLine(`SHADOW PROTOCOLS: ACTIVE`);
        addLine(`IDS ALERTS COUNT: ${Math.floor(Math.random() * 100) + 400}`);
        break;

      case 'logs':
        addLine('--- INTERCEPTING FIREWALL LOG STREAM ---');
        for (let i = 0; i < 5; i++) {
          const mockIP = `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
          addLine(`[IDS_WARN] Detected Port Scan on target node: ${mockIP} - ACTION: MONITORED`);
        }
        break;

      case 'matrix':
        setMatrixActive(true);
        addLine('ENGAGING DIGITAL CASCADE STREAM...');
        break;

      case 'scan':
        const targetIP = args[1] || '172.16.84.103';
        runPortScan(targetIP);
        break;

      case 'decrypt':
        initializeHackingGame();
        break;

      default:
        addLine(`COMMAND "${command}" NOT ENCODED. Type "help" for valid directives.`);
        soundManager.playError();
        break;
    }

    setInputValue('');
  };

  const runPortScan = (ip) => {
    setIsScanning(true);
    addLine(`CONNECTING TO NEURAL ROUTER NODE: ${ip}`);
    soundManager.playTone(300, 'sine', 0.2, 0.05);

    let step = 0;
    const ports = [22, 80, 443, 8080, 3306];
    
    scanIntervalRef.current = setInterval(() => {
      if (step < ports.length) {
        const port = ports[step];
        const status = Math.random() < 0.65 ? 'OPEN' : 'FILTERED / RETRY';
        addLine(`  -> PORT ${port} [${status}]`);
        soundManager.playScan();
        step++;
      } else {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
        addLine(`SCAN PROTOCOL COMPLETION FOR ${ip}. SEC-OVERWATCH LEVEL: SECURE.`);
        setIsScanning(false);
        soundManager.playSuccess();
      }
    }, 600);
  };

  const initializeHackingGame = () => {
    const secret = CANDIDATES[Math.floor(Math.random() * CANDIDATES.length)];
    setHackState({ secret, tries: 4 });
    addLine('==================================================');
    addLine('COGNITIVE MAINFRAME DECRYPTION TERMINAL ACTIVE');
    addLine('ENTER KEYWORD MATCH TO BYPASS SECURITY CORES');
    addLine(`CANDIDATES: ${CANDIDATES.join(', ')}`);
    addLine('TRIES REMAINING: 4');
    addLine('==================================================');
    soundManager.playAlarm();
  };

  const handleHackGuess = (guess) => {
    if (!CANDIDATES.includes(guess)) {
      addLine(`BAD SYMBOL STREAM: "${guess}" IS NOT A VALID CANDIDATE.`);
      soundManager.playError();
      return;
    }

    const { secret, tries } = hackState;
    if (guess === secret) {
      addLine(`>> ACCESS GRANTED. CREDENTIAL DECRYPTED: "${secret}"`);
      addLine('==================================================');
      soundManager.playSuccess();
      setHackState(null);
    } else {
      const nextTries = tries - 1;
      // Calculate matching characters
      let matches = 0;
      for (let i = 0; i < Math.min(guess.length, secret.length); i++) {
        if (guess[i] === secret[i]) matches++;
      }

      addLine(`>> DECRYPTION FAILURE. ${matches}/${secret.length} BYTE MATCHES.`);
      soundManager.playError();

      if (nextTries <= 0) {
        addLine('>> DECRYPTION LOCKOUT INITIATED. INTRUDER LOGGED.');
        addLine('==================================================');
        setHackState(null);
      } else {
        setHackState({ secret, tries: nextTries });
        addLine(`TRIES REMAINING: ${nextTries}`);
      }
    }
  };

  return (
    <div className="cyber-terminal-container" onClick={() => inputRef.current?.focus()} style={{ position: 'relative', border: '1px solid rgba(0, 240, 255, 0.15)', background: 'rgba(2, 6, 12, 0.85)', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {matrixActive && (
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, background: '#000', pointerEvents: 'none' }} />
      )}

      {/* Terminal Titlebar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(0, 240, 255, 0.08)', borderBottom: '1px solid rgba(0, 240, 255, 0.15)', fontFamily: '"Orbitron", sans-serif', fontSize: '11px', letterSpacing: '1.5px', color: '#00f0ff' }}>
        <span>NEXUS-SHELL // OPERATOR: ACTIVE</span>
        <span style={{ color: matrixActive ? '#39ff14' : 'inherit' }}>
          {matrixActive ? '[MATRIX MODE]' : '[SEC-CORE-0]'}
        </span>
      </div>

      {/* Terminal Output */}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', fontFamily: '"Share Tech Mono", monospace', fontSize: '11.5px', lineHeight: '1.45', color: '#00f0ff', textShadow: '0 0 3px rgba(0, 240, 255, 0.3)' }}>
        <div style={{ flexGrow: 1 }}>
          {history.map((line, idx) => (
            <div key={idx} style={{ whiteSpace: 'pre-wrap', marginBottom: '3px' }}>
              {line}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Prompt */}
        <form onSubmit={(e) => { e.preventDefault(); handleCommand(inputValue); }} style={{ display: 'flex', alignItems: 'center', marginTop: '10px', borderTop: '1px solid rgba(0, 240, 255, 0.08)', paddingTop: '8px' }}>
          <span style={{ color: '#39ff14', marginRight: '6px', fontWeight: 'bold' }}>op@cyber-nexus:~#</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isScanning}
            autoFocus
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#00f0ff', fontFamily: '"Share Tech Mono", monospace', fontSize: '11.5px', textShadow: '0 0 3px rgba(0, 240, 255, 0.3)' }}
            placeholder={isScanning ? 'Scan executing...' : matrixActive ? 'Type exit...' : 'Input directive...'}
          />
          <span className="terminal-cursor" />
        </form>
      </div>
    </div>
  );
}
