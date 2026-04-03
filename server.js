const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');

const app = express();
app.use(express.json());

// --- DYNAMIC PATH SETTINGS ---
const PROJECTS_ROOT = path.join(__dirname, 'projects');
const PULLED_BASE = path.join(__dirname, 'files');

if (!fs.existsSync(PROJECTS_ROOT)) fs.mkdirSync(PROJECTS_ROOT, { recursive: true });
if (!fs.existsSync(PULLED_BASE)) fs.mkdirSync(PULLED_BASE, { recursive: true });

// --- PROXY ENGINE ---
const proxy = httpProxy.createProxyServer({
    ws: true // Enable WebSockets for the Editor Terminals
});

proxy.on('error', (err, req, res) => {
    if (res && !res.headersSent && res.writeHead) {
        res.writeHead(502).end("Bad Gateway: Engine Connection Reset");
    }
    console.log("⚠️ Proxy Error:", err.code);
});

// --- REVERSE PROXY MIDDLEWARE ---
// This handles routing /vscodium -> localhost:8080 and /vscode -> localhost:8081
app.use('/vscodium', (req, res) => {
    proxy.web(req, res, { target: 'http://127.0.0.1:8080' });
});

app.use('/vscode', (req, res) => {
    proxy.web(req, res, { target: 'http://127.0.0.1:8081' });
});

// --- ENGINE LAUNCHER (Updated for Linux/Cloud) ---
const launch = (type, port) => {
    const availableFolders = fs.readdirSync(PULLED_BASE);
    
    // Switch between .cmd (Windows) and extensionless (Linux)
    const isWin = process.platform === "win32";
    const binName = type === 'vscodium' ? (isWin ? 'codium.cmd' : 'codium') : (isWin ? 'code.cmd' : 'code');
    
    let finalBinPath = null;
    for (const folder of availableFolders) {
        if (folder.toLowerCase().includes(type)) {
            const testPath = path.join(PULLED_BASE, folder, 'bin', binName);
            if (fs.existsSync(testPath)) { finalBinPath = testPath; break; }
        }
    }
    if (!finalBinPath) return console.log(`❌ Binary for ${type} not found.`);

    // Session directory
    const sessionDir = path.join(__dirname, 'sessions', `${type}-${port}`);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    console.log(`🚀 Launching ${type} on internal port ${port}`);

    // Standard arguments for VS Code Web Server
    const args = [
        'serve-web',
        '--host', '127.0.0.1',
        '--port', port.toString(),
        '--without-connection-token',
        '--accept-server-license-terms',
        '--server-data-dir', sessionDir
    ];

    const cmd = isWin ? 'cmd.exe' : finalBinPath;
    const finalArgs = isWin ? ['/s', '/c', `"${finalBinPath}" ${args.join(' ')}`] : args;

    spawn(cmd, finalArgs, { 
        cwd: path.dirname(finalBinPath), 
        shell: true, 
        windowsVerbatimArguments: isWin 
    });
};

// Start internal editors
launch('vscodium', 8080);
launch('vscode', 8081);

// --- UI ---
app.get('/', (req, res) => {
    const frontendProjectsPath = PROJECTS_ROOT.replace(/\\/g, '/');
    res.send(`<body style="background:#1e1e1e;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="background:#252526;padding:30px;border-radius:12px;width:450px;text-align:center;border:1px solid #333;">
            <h2 style="color:#007acc;margin-bottom:20px;">Editor Manager</h2>
            <input type="text" id="n" placeholder="Project Name" style="padding:12px;width:90%;margin-bottom:20px;background:#333;color:white;border:1px solid #555;border-radius:6px;text-align:center;">
            <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                <button onclick="go('vscodium')" style="flex:1;min-width:140px;padding:12px;background:#007acc;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Launch Codium</button>
                <button onclick="go('vscode')" style="flex:1;min-width:140px;padding:12px;background:#2ecc71;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Launch VS Code</button>
            </div>
        </div>
        <script>
            async function go(t){
                const n = document.getElementById('n').value; 
                if(!n) return alert("Project Name Required");
                await fetch('/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n})});
                
                // Construct the folder path for VS Code Remote
                const path = '${frontendProjectsPath}/' + n;
                const folderParam = '/?folder=vscode-remote://localhost' + encodeURIComponent(path);
                
                // Simply redirect to the proxied path
                window.open(window.location.origin + '/' + t + folderParam, '_blank');
            }
        </script>
    </body>`);
});

// API Routes
app.post('/create', (req, res) => {
    const target = path.join(PROJECTS_ROOT, req.body.name);
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
    res.json({success:true});
});

// --- SERVER START ---
const server = http.createServer(app);

// Enable WebSocket Proxying (For the Editor Terminal)
server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/vscodium')) {
        proxy.ws(req, socket, head, { target: 'http://127.0.0.1:8080' });
    } else if (req.url.startsWith('/vscode')) {
        proxy.ws(req, socket, head, { target: 'http://127.0.0.1:8081' });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`✅ Manager & Proxy live on port ${PORT}`));