const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const net = require('net');
const httpProxy = require('http-proxy');

const app = express();
app.use(express.json());

// --- DYNAMIC PATH SETTINGS ---
const PROJECTS_ROOT = path.join(__dirname, 'projects');
const PULLED_BASE = path.join(__dirname, 'files');

// Ensure directories exist relative to the script location
if (!fs.existsSync(PROJECTS_ROOT)) fs.mkdirSync(PROJECTS_ROOT, { recursive: true });
if (!fs.existsSync(PULLED_BASE)) fs.mkdirSync(PULLED_BASE, { recursive: true });

// --- PROXY SETUP WITH ERROR HANDLING ---
const proxy = httpProxy.createProxyServer({});

// Prevent crash on ECONNRESET (common in Dev Tunnels/Node v24+)
proxy.on('error', (err, req, res) => {
    if (!res.headersSent && res.writeHead) {
        res.writeHead(502).end("Bad Gateway: Engine Connection Reset");
    }
    console.log("⚠️ Proxy Error:", err.code);
});

// --- SSL LOAD ---
let sslOptions = null;
try {
    const files = fs.readdirSync(__dirname);
    const key = files.find(f => f.endsWith('.key.pem') || f.endsWith('.key') || (f.endsWith('.pem') && f.toLowerCase().includes('key')));
    const cert = files.find(f => f.endsWith('.cert.pem') || f.endsWith('.cert') || f.endsWith('.crt') || (f.endsWith('.pem') && !f.toLowerCase().includes('key')));
    if (key && cert) {
        sslOptions = { 
            key: fs.readFileSync(path.join(__dirname, key)), 
            cert: fs.readFileSync(path.join(__dirname, cert)) 
        };
        console.log(`🔐 SSL Active`);
    }
} catch (e) {}

// --- PORT PROXY ---
const occupy = (pub, target, isExp = false) => {
    const h = isExp ? app : (req, res) => {
        proxy.web(req, res, { target: `http://127.0.0.1:${target}`, ws: true });
    };
    const s1 = http.createServer(h);
    const s2 = sslOptions ? https.createServer(sslOptions, h) : null;
    const up = (req, soc, head) => proxy.ws(req, soc, head, { target: `http://127.0.0.1:${target}` });
    s1.on('upgrade', up); if(s2) s2.on('upgrade', up);
    net.createServer(c => {
        c.once('data', b => {
            const t = (b[0] === 22 && s2) ? s2 : s1;
            t.emit('connection', c); c.unshift(b);
        });
    }).listen(pub, '0.0.0.0');
};

// --- ENGINE LAUNCHER ---
const launch = (type, port) => {
    const availableFolders = fs.readdirSync(PULLED_BASE);
    const binName = type === 'vscodium' ? 'codium.cmd' : 'code.cmd';
    
    let finalBinPath = null;
    for (const folder of availableFolders) {
        if (folder.toLowerCase().includes(type)) {
            const testPath = path.join(PULLED_BASE, folder, 'bin', binName);
            if (fs.existsSync(testPath)) { finalBinPath = testPath; break; }
        }
    }
    if (!finalBinPath) return;

    const sessionDir = path.join(process.env.TEMP, `${type}-session-${port}`);
    const userSettingsDir = path.join(sessionDir, 'User');
    if (!fs.existsSync(userSettingsDir)) fs.mkdirSync(userSettingsDir, { recursive: true });
    
    const settings = {
        "workbench.colorTheme": "Default Dark Modern",
        "terminal.integrated.defaultProfile.windows": "PowerShell",
        "powershell.integratedConsole.showOnStartup": true,
        "terminal.integrated.gpuAcceleration": "off"
    };
    fs.writeFileSync(path.join(userSettingsDir, 'settings.json'), JSON.stringify(settings, null, 4));

    const fullCmd = `"${finalBinPath}" serve-web --host 127.0.0.1 --port ${port} --without-connection-token --accept-server-license-terms --server-data-dir "${sessionDir}"`;
    spawn('cmd.exe', ['/s', '/c', `"${fullCmd}"`], { cwd: path.dirname(finalBinPath), shell: true, windowsVerbatimArguments: true });
};

// Start Editors
launch('vscodium', 8080);
launch('vscode', 8081);

// Bridge Ports
occupy(3000, null, true);
occupy(8000, 8080);
occupy(8001, 8081);

// --- UI ---
app.get('/', (req, res) => {
    // Escape backslashes for the frontend string
    const frontendProjectsPath = PROJECTS_ROOT.replace(/\\/g, '/');
    
    res.send(`<body style="background:#1e1e1e;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="background:#252526;padding:30px;border-radius:12px;width:450px;text-align:center;border:1px solid #333;">
            <h2 style="color:#007acc;margin-bottom:20px;">Editor Manager</h2>
            <input type="password" id="n" placeholder="Project Name" style="padding:12px;width:90%;margin-bottom:20px;background:#333;color:white;border:1px solid #555;border-radius:6px;text-align:center;">
            <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                <button onclick="go('vscodium')" style="flex:1;min-width:140px;padding:12px;background:#007acc;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Launch Codium</button>
                <button onclick="go('vscode')" style="flex:1;min-width:140px;padding:12px;background:#2ecc71;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Launch VS Code</button>
                <button onclick="del()" style="width:100%;padding:10px;background:#e74c3c;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;margin-top:10px;">🗑️ Delete Project</button>
            </div>
        </div>
        <script>
            async function go(t){
                const n = document.getElementById('n').value; 
                if(!n) return alert("Project Name Required");

                await fetch('/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n})});

                const p = t === 'vscodium' ? 8000 : 8001;
                const path = '${frontendProjectsPath}/' + n;
                const folderParam = '/?folder=vscode-remote://localhost' + encodeURIComponent(path);
                
                let finalUrl;
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    finalUrl = window.location.origin.replace(':3000', ':' + p) + folderParam;
                } else {
                    finalUrl = window.location.origin.replace('-3000', '-' + p) + folderParam;
                }
                window.open(finalUrl, '_blank');
            }

            async function del(){
                const n = document.getElementById('n').value; 
                if(!n) return alert("Project Name Required");
                if(!confirm("Delete '" + n + "'?")) return;
                const res = await fetch('/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n})});
                const data = await res.json();
                alert(data.message);
            }
        </script>
    </body>`);
});

// --- API ---
app.post('/create', (req, res) => {
    const target = path.join(PROJECTS_ROOT, req.body.name);
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
        fs.writeFileSync(path.join(target, 'main.js'), '// New Project Created');
    }
    res.json({success:true});
});

app.post('/delete', (req, res) => {
    const target = path.join(PROJECTS_ROOT, req.body.name);
    if (fs.existsSync(target)) {
        try {
            fs.rmSync(target, { recursive: true, force: true });
            res.json({success:true, message: "Deleted successfully."});
        } catch (e) {
            res.json({success:false, message: "Delete failed. File in use."});
        }
    } else {
        res.json({success:false, message: "Project not found."});
    }
});