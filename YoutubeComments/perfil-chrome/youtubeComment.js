const { chromium } = require('playwright');
const path = require('path');

/**
 * Função principal que automatiza a busca e o comentário em um vídeo do YouTube.
 * @param {string} videoTitle - O título ou termo de busca para o vídeo.
 * @param {string} commentText - O texto a ser postado no comentário.
 * @param {number} videoIndex - O índice do vídeo a ser clicado (0 = primeiro, 1 = segundo, etc.).
 */

async function commentOnYouTubeVideo(videoTitle, commentText, videoIndex = 1) { 
  const userDataDir = path.join(__dirname, 'meu-perfil-chrome');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = context.pages().length ? context.pages()[0] : await context.newPage();
  const wait = () => page.waitForTimeout(2000);

  try {
    console.log('🚀 Navegando para o YouTube para verificar o login...');
    await page.goto('https://www.youtube.com');
    await wait();

    console.log('🔎 Verificando se o login já foi feito...');
    await page.waitForSelector('button#avatar-btn', { timeout: 5000 });
    console.log('✅ Login confirmado! Iniciando a automação.');

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