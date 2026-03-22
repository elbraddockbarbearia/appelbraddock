/**
 * Script de autorização única do Google Calendar.
 *
 * Execute com:
 *   node authorize_google.js
 *
 * Vai abrir um servidor local brevemente para capturar o código do Google.
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'COLE_SEU_CLIENT_ID_AQUI.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'COLE_SEU_CLIENT_SECRET_AQUI';
const REDIRECT_URI = 'http://localhost:8080/oauth2callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n=== EL BRADDOCK — GOOGLE CALENDAR SETUP ===\n');
console.log('Abrindo servidor local na porta 3000 para capturar o codigo...\n');
console.log('Acesse esta URL no navegador:\n');
console.log(authUrl);
console.log('\n(Aguardando resposta do Google...)\n');

const server = http.createServer(async (req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  if (pathname !== '/oauth2callback') {
    res.writeHead(404);
    res.end();
    return;
  }

  const code = query.code;
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2>Erro: codigo nao recebido.</h2>');
    server.close();
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <html><body style="font-family:monospace;padding:30px;background:#111;color:#fff">
      <h2 style="color:#d4af37">✅ Autorização concluída!</h2>
      <p>Copie as linhas abaixo para o arquivo <b>backend/.env</b>:</p>
      <pre style="background:#222;padding:15px;border-radius:8px;color:#22c55e;font-size:14px">GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
GOOGLE_CALENDAR_ID=SEU_EMAIL@gmail.com</pre>
      <p style="color:#aaa">Substitua <b>SEU_EMAIL@gmail.com</b> pelo seu Gmail real.</p>
      <p style="color:#aaa">Depois reinicie o backend com <b>npm run dev</b>.</p>
      <p style="color:#555">Pode fechar esta janela.</p>
      </body></html>
    `);

    console.log('\n=== SUCESSO! Copie para o .env: ===\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GOOGLE_CALENDAR_ID=SEU_EMAIL@gmail.com`);
    console.log('\nSubstitua SEU_EMAIL@gmail.com pelo seu Gmail.');
    console.log('\nReinicie o backend depois!');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h2>Erro: ${err.message}</h2>`);
    console.error('Erro:', err.message);
  }

  server.close();
});

server.listen(8080, '127.0.0.1', () => {
  // Try to auto-open the browser
  const { exec } = require('child_process');
  exec(`start "" "${authUrl}"`, (err) => {
    if (err) console.log('(Abra a URL manualmente no navegador)');
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Porta 3000 ja esta em uso. Pare o servidor frontend e tente novamente.');
  } else {
    console.error('Erro no servidor:', err.message);
  }
  process.exit(1);
});
