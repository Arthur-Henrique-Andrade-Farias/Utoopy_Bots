const { chromium } = require('playwright-extra');
const path = require('path');
const fs = require('fs');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
chromium.use(StealthPlugin());

async function commentOnYouTubeVideo(videoTitle, commentText) {
  const authFile = './auth.json';

  if (!fs.existsSync(authFile)) {
    throw new Error(`Arquivo de autenticação "${authFile}" não encontrado.`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: authFile });
  const page = context.pages().length ? context.pages()[0] : await context.newPage();
  
  const wait = () => {
    const randomDelay = Math.floor(Math.random() * (7000 - 5000 + 1)) + 5000;
    console.log(`...Aguardando por ${(randomDelay / 1000).toFixed(1)} segundos...`);
    return page.waitForTimeout(randomDelay);
  };

  try {
    console.log('🚀 Navegando para o YouTube...');
    await wait();
    await page.goto('https://www.youtube.com');
    await page.waitForSelector('button#avatar-btn', { timeout: 15000 });
    console.log('✅ Login confirmado!');

    await wait();
    await page.getByRole('combobox', { name: 'Pesquisar' }).fill(videoTitle);
    await wait();
    await page.keyboard.press('Enter');
    await page.waitForLoadState('domcontentloaded');

    const filtersButton = page.getByRole('button', { name: 'Filtros de enquete' });
    
    await wait();
    await filtersButton.click();
    await wait();
    await page.getByRole('link', { name: 'Vídeo', exact: true }).click();
    await page.waitForLoadState('domcontentloaded');
    await wait();
    
    await filtersButton.click();
    await wait();
    await page.getByRole('link', { name: 'a 20 minutos' }).click();
    await page.waitForLoadState('domcontentloaded');

    const dateFilters = ['Última hora', 'Hoje', 'Esta semana'];
    let previousFilter = null; 

    for (const dateFilter of dateFilters) {
      console.log(`\n--- 🕵️‍♂️ TENTANDO COM O FILTRO DE DATA: "${dateFilter}" ---`);
      
      if (previousFilter !== null) {
        await wait();
        await filtersButton.click();
        await wait();
        await page.getByRole('link', { name: previousFilter, exact: true }).click();
        await page.waitForLoadState('domcontentloaded');
      }

      await wait();
      await filtersButton.click();
      await wait();
      await page.getByRole('link', { name: dateFilter, exact: true }).click();
      await page.waitForLoadState('domcontentloaded');
      
      previousFilter = dateFilter;
      
      await wait();

      if (await page.getByText('Nenhum resultado encontrado', { exact: true }).isVisible()) {
        console.log(`...Nenhum vídeo encontrado para "${dateFilter}". Tentando próximo filtro...`);
        continue;
      }
      
      const videoCount = await page.locator('ytd-video-renderer a#video-title').count();
      const attempts = Math.min(videoCount, 5); 
      console.log(`Encontrados ${videoCount} vídeos. Tentando os ${attempts} primeiros.`);

      for (let i = 0; i < attempts; i++) {
        console.log(`\n--- 🎬 Testando o ${i + 1}º vídeo da lista... ---`);
        const targetVideoLink = page.locator('ytd-video-renderer a#video-title').nth(i);
        
        await wait();
        await targetVideoLink.scrollIntoViewIfNeeded();
        const videoUrl = await targetVideoLink.getAttribute('href');
        const fullUrl = new URL(videoUrl, 'https://www.youtube.com').toString();
        
        const videoPage = await context.newPage();
        await wait();
        await videoPage.goto(fullUrl);

        try {
          console.log('...Verificando seção de comentários...');
          await wait();
          await videoPage.locator('#comments').scrollIntoViewIfNeeded();
          await videoPage.waitForTimeout(3000); 

          if (await videoPage.getByText('0 comentários', { exact: true }).isVisible()) {
            console.log('❌ Vídeo com 0 comentários. Desistindo e tentando o próximo.');
            await videoPage.close();
            continue; 
          }

          console.log('✅ Vídeo com comentários encontrados! Postando...');
          await wait();
          await videoPage.getByText('Adicione um comentário…').click();
          await wait();
          const commentInput = videoPage.getByLabel('Adicione um comentário…');

          await commentInput.click();

          for (const char of commentText) {
            await commentInput.press(char);
            const randomDelay = Math.floor(Math.random() * 200) + 50;
            await page.waitForTimeout(randomDelay);
          }
          await wait();
          await videoPage.getByRole('button', { name: 'Comentar' }).click();
          
          console.log(`✔️ Ação de comentar enviada. Aguardando finalização...`);
          await wait();
          await wait();
          await wait();
          
          await videoPage.close();
          
          console.log(fullUrl);
          return fullUrl;

        } catch (commentError) {
          console.log(`❌ Falha ao processar vídeo (${commentError.message}). Tentando o próximo.`);
          await videoPage.close();
          continue;
        }
      }
    }

    throw new Error('Não foi possível encontrar nenhum vídeo com comentários ativados após todas as tentativas.');

  } catch (error) {
    console.error('❌ Ocorreu um erro fatal durante a automação:', error.message);
    throw error;
  } finally {
    console.log('\nScript finalizado.');
    await context.close();
  }
}

module.exports = { commentOnYouTubeVideo };

if (require.main === module) {

  (async () => {

  const tituloParaTeste = "Video game";

  const comentarioParaTeste = "Adoro jogar!";

  await commentOnYouTubeVideo(tituloParaTeste, comentarioParaTeste, 0);

  })();

}