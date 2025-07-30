const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * Encontra um vídeo no YouTube com base nos filtros exatos e retorna seu título e URL.
 * @param {string} searchTerm - O termo de busca para o vídeo.
 * @param {number} videoIndex - O índice do vídeo a ser selecionado (0 = primeiro, 1 = segundo, etc.).
 * @param {object} options - Opções de execução, como { headless: false }.
 */
async function findYouTubeVideo(searchTerm, videoIndex = 0, options = { headless: true }) {
  const authFile = './auth.json';

  if (!fs.existsSync(authFile)) {
    throw new Error(`Arquivo de autenticação "${authFile}" não encontrado. Execute "salvar-sessao.js" primeiro.`);
  }

  const browser = await chromium.launch({ headless: options.headless });
  const context = await browser.newContext({ storageState: authFile });
  const page = context.pages().length ? context.pages()[0] : await context.newPage();
  
  const wait = () => {
    const minMilliseconds = 5000;
    const maxMilliseconds = 7000;
    const randomDelay = Math.floor(Math.random() * (maxMilliseconds - minMilliseconds + 1)) + minMilliseconds;
    console.log(`...Aguardando por ${(randomDelay / 1000).toFixed(1)} segundos...`);
    return page.waitForTimeout(randomDelay);
  };

  try {
    console.log('🚀 Navegando para o YouTube com a sessão salva...');
    await page.goto('https://www.youtube.com');
    
    await page.waitForSelector('button#avatar-btn', { timeout: 15000 });
    console.log('✅ Login via sessão salva bem-sucedido!');
    
    await page.getByRole('combobox', { name: 'Pesquisar' }).fill(searchTerm);
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
    
    console.log(`🎯 Localizando o ${videoIndex + 1}º vídeo...`);
    const targetVideoLink = page.locator('ytd-video-renderer a#video-title').nth(videoIndex);
    
    console.log('...Garantindo que o vídeo esteja visível...');
    await targetVideoLink.scrollIntoViewIfNeeded();
    
    console.log('...Extraindo título e URL...');
    const videoTitle = await targetVideoLink.innerText({ timeout: 10000 });
    const videoUrl = await targetVideoLink.getAttribute('href');
    
    const fullUrl = new URL(videoUrl, 'https://www.youtube.com').toString();

    console.log(`✔️ Dados extraídos: "${videoTitle}"`);
    
    return { 
      title: videoTitle,
      url: fullUrl 
    };

  } catch (error) {
    console.error('❌ Ocorreu um erro durante a automação:', error.message);
    throw error;
  } finally {
    console.log('\nScript finalizado. Fechando o navegador.');
    await context.close();
  }
}

module.exports = { findYouTubeVideo };

if (require.main === module) {
  (async () => {
    const tituloParaTeste = "viagem";
    const indiceDoVideo = 0;
    
    console.log(`--- Iniciando teste local para: "${tituloParaTeste}" ---`);
    
    try {
      const videoData = await findYouTubeVideo(tituloParaTeste, indiceDoVideo, { headless: true });
      
      console.log('\n--- Teste finalizado com sucesso! ---');
      console.log('Dados encontrados:', videoData);
    } catch (error) {
      console.error('\n--- Teste falhou ---');
    }
  })();
}