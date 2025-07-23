const { chromium } = require('playwright');
const path = require('path');

/**
 * Função principal que automatiza a busca e o comentário em um vídeo do YouTube.
 * @param {string} videoTitle - O título ou termo de busca para o vídeo.
 * @param {string} commentText - O texto a ser postado no comentário.
 * @param {number} videoIndex - O índice do vídeo a ser clicado (0 = primeiro, 1 = segundo, etc.).
 */

async function commentOnYouTubeVideo(videoTitle, commentText, videoIndex = 1) {
  const email = process.env.GOOGLE_EMAIL;
  const password = process.env.GOOGLE_PASSWORD;

  const userDataDir = path.join(__dirname, 'meu-perfil-chrome');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = context.pages().length ? context.pages()[0] : await context.newPage();
  const wait = () => page.waitForTimeout(2000);

  try {
    console.log('🚀 Navegando para o YouTube...');
    await page.goto('https://www.youtube.com');

    // --- LÓGICA DE LOGIN HÍBRIDA ---
    try {
      // TENTATIVA RÁPIDA: Tenta encontrar o avatar usando o perfil salvo
      console.log('🔎 Verificando login via perfil salvo (tentativa rápida)...');
      await page.waitForSelector('button#avatar-btn', { timeout: 5000 });
      console.log('✅ Login via perfil salvo bem-sucedido!');

    } catch (error) {
      // PLANO B: Se a tentativa rápida falhou, executa o login programático
      console.log('⚠️ Perfil salvo não funcionou ou expirou. Iniciando login programático...');
      
      if (!email || !password) {
        throw new Error('Login via perfil falhou e as variáveis de ambiente GOOGLE_EMAIL e GOOGLE_PASSWORD não foram definidas.');
      }

      await page.goto('https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin');
      
      await page.getByLabel('E-mail ou telefone').pressSequentially(email, { delay: 50 });
      await page.getByRole('button', { name: 'Avançar' }).click();
      
      const passwordInput = page.getByLabel('Digite sua senha');
      await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
      await passwordInput.pressSequentially(password, { delay: 50 });
      await page.getByRole('button', { name: 'Avançar' }).click();
      
      // Verificação final do login programático
      await page.goto('https://www.youtube.com');
      await page.waitForSelector('button#avatar-btn', { timeout: 20000 });
      console.log('✅ Login programático bem-sucedido!');
    }

    await page.getByRole('combobox', { name: 'Pesquisar' }).click();
    await wait();

    await page.getByRole('combobox', { name: 'Pesquisar' }).fill(videoTitle); 
    await wait();

    await page.getByRole('combobox', { name: 'Pesquisar' }).press('Enter');
    await wait();

    await page.getByRole('button', { name: 'Filtros de enquete' }).click(); 
    await wait();

    await page.getByRole('link', { name: 'Vídeo', exact: true }).click();
    await wait();

    await page.getByRole('button', { name: 'Filtros de enquete' }).click(); 
    await wait();

    await page.getByRole('link', { name: 'a 20 minutos' }).click(); 
    await wait();

    await page.getByRole('button', { name: 'Filtros de enquete' }).click();
    await wait();

    await page.getByRole('link', { name: 'Última hora' }).click();
    await wait();

    await page.locator('ytd-video-renderer a#video-title').nth(videoIndex).click();
    await wait();

    await page.waitForURL('**/watch?v=**');
    const finalUrl = page.url(); 
    console.log(`🔗 Link final capturado: ${finalUrl}`);

    await page.keyboard.press('PageDown');
    await wait();

    await page.getByText('Adicione um comentário…').click();
    await wait();

    await page.getByLabel('Adicione um comentário…').fill(commentText); 
    await wait();

    await page.getByRole('button', { name: 'Comentar' }).click();
    console.log(`✔️ Comentário "${commentText}" enviado com sucesso!`);

    return finalUrl;


  } catch (error) {
    console.error('❌ Ocorreu um erro durante a automação:', error.message);
    if (error.message.includes('button#avatar-btn')) {
        console.log('\n❗️ --- AÇÃO NECESSÁRIA: FAÇA O LOGIN --- ❗️');
    }
  } finally {
    console.log('\nScript finalizado. A janela fechará em 15 segundos.');
    await page.waitForTimeout(15000);
    await context.close();
  }
}

module.exports = { commentOnYouTubeVideo };

if (require.main === module) {
  (async () => {
    const tituloParaTeste = "viagem para o japão";
    const comentarioParaTeste = "Que vídeo incrível!";
    
    await commentOnYouTubeVideo(tituloParaTeste, comentarioParaTeste, 0);
  })();
}