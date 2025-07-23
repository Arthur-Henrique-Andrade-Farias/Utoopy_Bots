const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Função principal que automatiza a busca e o comentário em um vídeo do YouTube.
 * @param {string} videoTitle - O título ou termo de busca para o vídeo.
 * @param {string} commentText - O texto a ser postado no comentário.
 * @param {number} videoIndex - O índice do vídeo a ser clicado (0 = primeiro, 1 = segundo, etc.).
 */

async function commentOnYouTubeVideo(videoTitle, commentText, videoIndex = 1) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // --- LÓGICA DE LOGIN COM COOKIES ---
    console.log('🍪 Carregando cookies de autenticação...');
    const cookiesFilePath = path.join(__dirname, 'cookies.json');
    if (!fs.existsSync(cookiesFilePath)) {
      throw new Error('Arquivo "cookies.json" não encontrado. Execute "salvar-cookies.js" primeiro.');
    }
    const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf8'));
    await context.addCookies(cookies);
    console.log('...Cookies injetados.');
    
    await page.goto('https://www.youtube.com');
    
    // --- NOVA LÓGICA: TRATAMENTO DO POP-UP DE CONSENTIMENTO ---
    try {
      console.log('🔎 Verificando se há um pop-up de consentimento de cookies...');
      // O seletor busca um botão que contenha o texto "Aceitar tudo"
      const acceptButton = page.locator('button:has-text("Aceitar tudo")');
      // Usamos um timeout curto, pois este pop-up nem sempre aparece.
      await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
      await acceptButton.click();
      console.log('✔️ Pop-up de consentimento encontrado e aceito!');
      await page.waitForTimeout(2000); // Pequena pausa para a página recarregar
    } catch (error) {
      // Se o botão não for encontrado, não é um erro. Apenas significa que o pop-up não apareceu.
      console.log('...Nenhum pop-up de consentimento encontrado, continuando.');
    }

    // Navega para o YouTube JÁ LOGADO
    await page.goto('https://www.youtube.com');
    
    // Confirma que o login funcionou
    await page.waitForSelector('button#avatar-btn', { timeout: 15000 });
    console.log('✅ Login via cookies bem-sucedido!');
    

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