"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stop = exports.start = exports.runningPort = exports.online = exports.status = void 0;
const vscode_1 = require("vscode");
const http = require("http");
const connect = require("connect");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const zlib = require("zlib");
let app = connect();
var httpProxy = require("http-proxy");
// Configuration
const configs = vscode_1.workspace.getConfiguration("vs-browser");
const HOST = "localhost";
const PORT = configs.get("localProxyServer.port") || 9999;
const cookieDomainRewrite = configs.get("localProxyServer.cookieDomainRewrite") || false;
exports.status = 0;
exports.online = 0;
exports.runningPort = 9999;
var proxy = httpProxy.createProxyServer();
proxy.on("proxyReq", (proxyReq, req) => {
    if (req.body) {
        const bodyData = JSON.stringify(req.body);
        // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        // stream the content
        proxyReq.write(bodyData);
    }
});
proxy.on("proxyRes", function (proxyRes, req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-Frame-Options", false);
    if (proxyRes.headers["content-type"]) {
        res.setHeader("Content-Type", proxyRes.headers["content-type"]);
    }
    proxyRes = decompress(proxyRes, proxyRes.headers["content-encoding"]);
    var buffer = Buffer.from("", "utf8");
    proxyRes.on("data", (chunk) => (buffer = Buffer.concat([buffer, chunk])));
    let body = null;
    proxyRes.on("end", function () {
        body = buffer.toString("utf8");
        if (res.hasHeader("Content-Type") &&
            res.getHeader("Content-Type").match(/([^;]+)*/g)[0] === "text/html") {
            console.log(req);
            // console.log(proxyRes.headers);
            let url = req.originalUrl;
            let regex = /(http(|s))\:\/\/([^\/]+)*/g;
            url = url.match(regex)[0];
            // Capture html tag not a|img and add the rest of the string of the tag after src|href="(capture)> to the new string
            // body = body.replaceAll(/<((?!a|img).*)(.*?) (src|href)=('|"|)((http(s|)).*?)>/g, '<$1$2 $3=$4http://' + HOST + ':' + PORT + '/$5>');
            // a|img tag will be same as before for proxy work and image get directly
            // body = body.replaceAll(/<(a|img) (.*?)(src|href)=('|"|)\/(.*?)('|"|)>/g, '<$1 $2$3=$4' + url + '/$5>');
            // Replace tag with src|href with relative path
            // body = body.replaceAll(/<((?!a|img).*) (.*?)(src|href)=('|"|)\/(.*?)('|"|)/g, '<$1 $2$3=$4http://' + HOST + ':' + PORT + '/' + url + '/$5>');
            // body = body.replaceAll(/<head>/g, '<head><base href="http://' + HOST + ':' + PORT + '/' + url + '">');
            // body = body.replaceAll(/head/g, '1');
        }
        else if (res.hasHeader("Content-Type") &&
            (res.getHeader("Content-Type").match(/([^;]+)*/g)[0] === "text/css" ||
                res.getHeader("Content-Type").match(/([^;]+)*/g)[0] ===
                    "text/javascript")) {
            let url = req.originalUrl;
            let regex = /(http(|s))\:\/\/([^\/]+)*/g;
            url = url.match(regex)[0];
            body = body.replaceAll(/(http(s|):\/\/(?!'|"))/g, "http://" + HOST + ":" + PORT + "/$1");
        }
        body = Buffer.from(body, "utf8");
        res.write(body);
        res.end();
    });
    if (proxyRes.statusCode === 301 ||
        proxyRes.statusCode === 302 ||
        proxyRes.hasOwnProperty("location")) {
        res.writeHead(301, {
            location: "http://" + HOST + ":" + PORT + "/" + proxyRes.headers.location,
        });
        res.end();
    }
});
function start(callback = () => { }) {
    if (exports.status === 0 || PORT !== exports.runningPort) {
        console.log("Local proxy server starting on port " + PORT);
        // Create the express app
        app.use(morgan("dev"));
        app.use(function (req, res) {
            let options = {
                target: null,
                ssl: {
                    key: fs.readFile(path.resolve(__dirname, "ssl/key.pem"), function read(err, data) { }),
                    cert: fs.readFile(path.resolve(__dirname, "ssl/cert.pem"), function read(err, data) { }),
                },
                xfwd: true,
                secure: false,
                changeOrigin: true,
                hostRewrite: true,
                autoRewrite: true,
                toProxy: true,
                cookieDomainRewrite: "",
                selfHandleResponse: true,
            };
            // Set the default response headers
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("X-Frame-Options", false);
            let url = req.url;
            let regex = /(http(|s))\:\/\/([^\/]+)*/g;
            if (regex.test(url)) {
                url = url.match(regex)[0];
                options.target = url;
                if (cookieDomainRewrite) {
                    options.cookieDomainRewrite = url;
                }
                req.url = req.url.split("/").splice(4).join("/");
                proxy.web(req, res, options);
            }
            else {
                res.writeHead(400, { contentType: "text/html" });
                res.write("Invalid request");
                res.end();
            }
        });
        http.createServer(app).listen(PORT, function () {
            exports.status = 1;
            exports.online++;
            exports.runningPort = PORT;
            console.log("Local proxy server started on port " + PORT);
            callback();
        });
    }
    else {
        console.log("Local proxy server already started on port " + PORT);
        exports.online++;
        callback();
    }
}
exports.start = start;
function stop(callback = () => { }) {
    exports.online--;
    if (exports.status === 1 && exports.online === 0) {
        console.log("Stopping local proxy server");
        proxy.close(function () {
            console.log("Proxy server stopped");
            app.close(function () {
                exports.status = 0;
                console.log("Local proxy server stopped");
                callback();
            });
        });
    }
    else {
        console.log("There are still " +
            exports.online +
            " connects so the proxy server will not be closed");
    }
}
exports.stop = stop;
function decompress(proxyRes, contentEncoding) {
    let _proxyRes = proxyRes;
    let decompress;
    switch (contentEncoding) {
        case "gzip":
            decompress = zlib.createGunzip();
            break;
        case "br":
            decompress = zlib.createBrotliDecompress();
            break;
        case "deflate":
            decompress = zlib.createInflate();
            break;
        default:
            break;
    }
    if (decompress) {
        _proxyRes.pipe(decompress);
        _proxyRes = decompress;
    }
    return _proxyRes;
}
//# sourceMappingURL=server.js.map