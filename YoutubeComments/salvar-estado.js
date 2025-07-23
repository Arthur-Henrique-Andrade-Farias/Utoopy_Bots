// salvar-sessao.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const authFile = 'auth.json';
// Usamos uma pasta temporária para o processo de login, que ajuda a "enganar" o Google
const tempProfileDir = path.join(__dirname, 'perfil-temporario-login');

(async () => {
  console.log('🚀 Iniciando navegador (com tática anti-detecção) para login manual...');

  // --- A TÁTICA ESTÁ AQUI ---
  // Usamos o launchPersistentContext para parecer um navegador normal
  const context = await chromium.launchPersistentContext(tempProfileDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const page = await context.newPage();
  
  await page.goto('https://accounts.google.com');

  console.log('\n--- AÇÃO NECESSÁRIA ---');
  console.log('1. A janela do navegador foi aberta.');
  console.log('2. Faça o login completo na sua conta Google/YouTube.');
  console.log('3. Após o login, volte para este terminal.');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  // Espera o usuário pressionar Enter no terminal
  await new Promise(resolve => {
    rl.question(`\n✅ Pressione ENTER aqui quando o login estiver concluído para salvar a sessão em "${authFile}"...`, resolve);
  });
  
  rl.close();

  console.log(`\n💾 Salvando o estado da sessão em "${authFile}"...`);
  // O comando mágico: salva cookies e outros dados de sessão no arquivo.
  await context.storageState({ path: authFile });

  console.log('✔️ Sessão salva com sucesso!');
  await context.close();
})();