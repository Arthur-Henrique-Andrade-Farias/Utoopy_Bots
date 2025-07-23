// salvar-cookies.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Vamos usar uma pasta de perfil temporária para o processo de login
const userDataDir = path.join(__dirname, 'perfil-para-login');

(async () => {
  console.log('🚀 Iniciando navegador para login manual...');

  // --- A TÁTICA ESTÁ AQUI ---
  // Usamos o launchPersistentContext para parecer um navegador normal
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const page = await context.newPage();
  
  await page.goto('https://accounts.google.com');

  console.log('\n--- AÇÃO NECESSÁRIA ---');
  console.log('1. A janela do navegador (que parece normal) foi aberta.');
  console.log('2. Faça o login completo na sua conta Google/YouTube.');
  console.log('3. Após o login, volte para este terminal.');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  // Espera o usuário pressionar Enter no terminal
  await new Promise(resolve => {
    rl.question('\n✅ Pressione ENTER aqui quando o login estiver concluído para salvar os cookies...', resolve);
  });
  
  rl.close();

  console.log('\n🍪 Salvando cookies de autenticação...');
  const cookies = await context.cookies();
  fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));

  console.log('✔️ Arquivo "cookies.json" salvo com sucesso!');
  await context.close();
})();