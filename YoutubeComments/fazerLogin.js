const { chromium } = require('playwright');
const path = require('path');

const NOME_DA_PASTA_PERFIL = 'meu-perfil-chrome';

(async () => {
  const userDataDir = path.join(__dirname, NOME_DA_PASTA_PERFIL);

  console.log(`🚀 Abrindo o navegador Chrome para login manual...`);
  console.log(`🗂️  Sua sessão será salva na pasta: "${userDataDir}"`);

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false, 
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = await context.newPage();
  await page.goto('https://accounts.google.com');

  console.log('\n--- AÇÃO NECESSÁRIA ---');
  console.log('✅ A janela do navegador está aberta e esperando por você.');
  console.log('   Por favor, faça o login completo na sua conta Google.');
  console.log('   O script está "parado" e só terminará quando você fechar a janela do navegador.');

  await page.waitForEvent('close', { timeout: 0 });

  console.log('\n✅ Navegador fechado!');
  console.log('   Sua sessão de login foi salva com sucesso na pasta.');
})();