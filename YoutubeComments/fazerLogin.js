const { chromium } = require('playwright');
const path = require('path');

// O nome da pasta onde a sessão (login, cookies) será salva.
// Deve ser o mesmo nome usado no seu Dockerfile e nos outros scripts.
const NOME_DA_PASTA_PERFIL = 'meu-perfil-chrome';

(async () => {
  // Cria o caminho completo para a pasta do perfil
  const userDataDir = path.join(__dirname, NOME_DA_PASTA_PERFIL);

  console.log(`🚀 Abrindo o navegador Chrome para login manual...`);
  console.log(`🗂️  Sua sessão será salva na pasta: "${userDataDir}"`);

  // Inicia um navegador "persistente". Tudo que você fizer nele será salvo.
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // `false` é essencial para que você possa ver e usar o navegador.
    args: ['--disable-blink-features=AutomationControlled']
  });

  // Abre uma nova página e navega para o site de login do Google.
  const page = await context.newPage();
  await page.goto('https://accounts.google.com');

  console.log('\n--- AÇÃO NECESSÁRIA ---');
  console.log('✅ A janela do navegador está aberta e esperando por você.');
  console.log('   Por favor, faça o login completo na sua conta Google.');
  console.log('   O script está "parado" e só terminará quando você fechar a janela do navegador.');

  // Esta linha pausa o script e fica esperando o evento de fechamento da página.
  // O timeout: 0 garante que ele espere o tempo que for necessário.
  await page.waitForEvent('close', { timeout: 0 });

  console.log('\n✅ Navegador fechado!');
  console.log('   Sua sessão de login foi salva com sucesso na pasta.');
})();