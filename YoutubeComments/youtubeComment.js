const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function commentOnYouTubeVideo(videoTitle, commentText, videoIndex = 1) {
  const authFile = './auth.json';

  if (!fs.existsSync(authFile)) {
    throw new Error(`Arquivo de autenticação "${authFile}" não encontrado. Execute "salvar-sessao.js" primeiro.`);
  }

  const browser = await chromium.launch({ headless: true });
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
    
    try {
        const acceptButton = page.locator('button:has-text("Aceitar tudo")');
        await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
        await acceptButton.click();
        console.log('✔️ Pop-up de consentimento aceito.');
    } catch (error) {
        console.log('...Nenhum pop-up de consentimento encontrado.');
    }
    
    await page.waitForSelector('button#avatar-btn', { timeout: 15000 });
    console.log('✅ Login via sessão salva bem-sucedido!');
    
    await page.getByRole('combobox', { name: 'Pesquisar' }).fill(videoTitle);
    await wait();
    await page.getByRole('combobox', { name: 'Pesquisar' }).press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await wait();

    const filtersButton = page.getByRole('button', { name: 'Filtros de enquete' });
    
    await filtersButton.click();
    await wait();
    await page.getByRole('link', { name: 'Vídeo', exact: true }).click();
    await page.waitForLoadState('domcontentloaded');
    await wait();

    await filtersButton.click();
    await wait();
    await page.getByRole('link', { name: 'a 20 minutos' }).click();
    await page.waitForLoadState('domcontentloaded');
    await wait();

    await filtersButton.click();
    await wait();
    await page.getByRole('link', { name: 'Última hora' }).click();
    await page.waitForLoadState('domcontentloaded');
    await wait();

    if (await page.getByText('Nenhum resultado encontrado', { exact: true }).isVisible()) {
      console.log('⚠️ Nenhum resultado encontrado. Tentando filtro "Hoje"...');
      
      await wait();
      await filtersButton.click();
      await wait();
      await page.getByRole('link', { name: 'Última hora' }).click();
      await wait();
      await filtersButton.click();
      await wait();
      await page.getByRole('link', { name: 'Hoje', exact: true }).click();
      await page.waitForLoadState('domcontentloaded');
      await wait();

      if (await page.getByText('Nenhum resultado encontrado', { exact: true }).isVisible()) {
        console.log('⚠️ Ainda sem resultados. Tentando filtro "Esta semana"...');

        await wait();
        await filtersButton.click();
        await wait();
        await page.getByRole('link', { name: 'Hoje', exact: true }).click();
        await wait();
        await filtersButton.click();
        await wait();
        await page.getByRole('link', { name: 'Esta semana' }).click();
        await page.waitForLoadState('domcontentloaded');
        await wait();
      }
    }
    
    await page.locator('ytd-video-renderer a#video-title').nth(videoIndex).click();
    await page.waitForURL('**/watch?v=**');
    const finalUrl = page.url();
    console.log(`🔗 Link final capturado: ${finalUrl}`);
    await wait();

    const commentsSection = page.locator('#comments');
    await commentsSection.scrollIntoViewIfNeeded();
    await wait();
    
    await page.getByText('Adicione um comentário…').click();
    await wait();
    await page.getByLabel('Adicione um comentário…').fill(commentText);
    await wait();
    await page.getByRole('button', { name: 'Comentar' }).click();
    console.log(`✔️ Comentário 1/2 enviado: "${commentText}"`);
    await wait();

    await page.evaluate(() => document.activeElement.blur());
    await wait();

    /*await page.getByLabel('Adicione um comentário…').click();
    await wait();
    await page.getByLabel('Adicione um comentário…').fill("Comentário feito com @Utoopy, venha conhecer!");
    await wait();
    await page.getByRole('button', { name: 'Comentar' }).click();
    console.log(`✔️ Comentário 2/2 enviado.`);
    await wait();*/

    return finalUrl;

  } catch (error) {
    console.error('❌ Ocorreu um erro durante a automação:', error.message);
    if (error.message.includes('button#avatar-btn')) {
        console.log('\n❗️ --- AÇÃO NECESSÁRIA: FAÇA O LOGIN --- ❗️');
    }
    throw error; 
  } finally {
    console.log('\nScript finalizado.');
    await context.close();
  }
}

module.exports = { commentOnYouTubeVideo };

if (require.main === module) {
  (async () => {
    const tituloParaTeste = "viagem";
    const comentarioParaTeste = "Adoro viajar!";
    await commentOnYouTubeVideo(tituloParaTeste, comentarioParaTeste, 0);
  })();
}