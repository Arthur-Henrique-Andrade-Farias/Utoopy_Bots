const { chromium } = require('playwright');
const path = require('path');
require('dotenv').config();

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
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = context.pages().length ? context.pages()[0] : await context.newPage();
  const wait = () => page.waitForTimeout(2000);

  try {
    console.log('🚀 Navegando para o YouTube...');
    await page.goto('https://www.youtube.com');

    // Tenta usar o perfil salvo primeiro
    try {
      console.log('🔎 Verificando login via perfil salvo (tentativa rápida)...');
      await page.waitForSelector('button#avatar-btn', { timeout: 5000 });
      console.log('✅ Login via perfil salvo bem-sucedido!');

    } catch (error) {
      // Se o perfil salvo falhar, inicia o login programático completo
      console.log('⚠️ Perfil salvo não funcionou. Iniciando login programático...');
      
      if (!email || !password) {
        throw new Error('Login via perfil falhou e as variáveis de ambiente GOOGLE_EMAIL e GOOGLE_PASSWORD não foram definidas.');
      }
      
      await page.goto('https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin');
      
      try {
        // TENTATIVA 1: Clicar no perfil "Utoopy" já listado
        console.log('   1. Verificando se o perfil "Utoopy" já está listado...');
        await page.getByRole('link', { name: /Utoopy/ }).click({ timeout: 15000 });
        console.log('   -> Perfil "Utoopy" encontrado e clicado!');
      } catch (e1) {
        console.log('   -> Perfil "Utoopy" não encontrado.');
        try {
          // TENTATIVA 2: Clicar em "Usar outra conta"
          console.log('   2. Verificando a opção "Usar outra conta"...');
          await page.getByRole('link', { name: 'Usar outra conta' }).click({ timeout: 15000 });
          console.log('   -> Clicado em "Usar outra conta".');
        } catch (e2) {
          // TENTATIVA 3 (FALLBACK): Prosseguir para digitar o e-mail
          console.log('   -> Nenhuma opção pré-definida encontrada. Prosseguindo para digitar o e-mail.');
        }
      }

      const emailInput = page.getByLabel('E-mail ou telefone');
      if (await emailInput.isVisible({ timeout: 5000 })) {
          console.log('   -> Digitando e-mail...');
          await emailInput.pressSequentially(email, { delay: 50 });
          await page.getByRole('button', { name: 'Avançar' }).click();
      }

      console.log('   -> Digitando senha...');
      const passwordInput = page.getByLabel('Digite sua senha');
      await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
      await passwordInput.pressSequentially(password, { delay: 50 });
      await page.getByRole('button', { name: 'Avançar' }).click();
      
      // Verificação final do login
      await page.goto('https://www.youtube.com');
      await page.waitForSelector('button#avatar-btn', { timeout: 20000 });
      console.log('✅ Login programático bem-sucedido!');
    }

    await page.getByRole('combobox', { name: 'Pesquisar',  timeout: 15000 }).click();
    await wait();

    await page.getByRole('combobox', { name: 'Pesquisar',  timeout: 15000 }).fill(videoTitle); 
    await wait();

    await page.getByRole('combobox', { name: 'Pesquisar',  timeout: 15000 }).press('Enter');
    await wait();

    await page.getByRole('button', { name: 'Filtros de enquete',  timeout: 15000 }).click(); 
    await wait();

    await page.getByRole('link', { name: 'Vídeo', exact: true,  timeout: 15000 }).click();
    await wait();

    await page.getByRole('button', { name: 'Filtros de enquete',  timeout: 15000 }).click(); 
    await wait();

    await page.getByRole('link', { name: 'a 20 minutos',  timeout: 15000 }).click(); 
    await wait();

    await page.getByRole('button', { name: 'Filtros de enquete',  timeout: 15000 }).click();
    await wait();

    await page.getByRole('link', { name: 'Última hora',  timeout: 15000 }).click();
    await wait();

    await page.locator('ytd-video-renderer a#video-title', { timeout: 15000 }).nth(videoIndex).click();
    await wait();

    await page.waitForURL('**/watch?v=**', { timeout: 15000 });
    const finalUrl = page.url(); 
    console.log(`🔗 Link final capturado: ${finalUrl}`);

    await page.keyboard.press('PageDown', { timeout: 15000 });
    await wait();

    await page.getByText('Adicione um comentário…', { timeout: 15000 }).click();
    await wait();

    await page.getByLabel('Adicione um comentário…', { timeout: 15000 }).fill(commentText); 
    await wait();

    await page.getByRole('button', { name: 'Comentar',  timeout: 15000 }).click();
    console.log(`✔️ Comentário "${commentText}" enviado com sucesso!`);

    return finalUrl;


  } catch (error) {
    console.error('❌ Ocorreu um erro durante a automação:', error.message);
    if (error.message.includes('button#avatar-btn', { timeout: 15000 })) {
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