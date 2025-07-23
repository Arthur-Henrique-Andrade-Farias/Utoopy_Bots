// youtubeCommenter.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function commentOnYouTubeVideo(videoTitle, commentText, videoIndex = 1) {
  const authFile = path.join(__dirname, 'auth.json');

  if (!fs.existsSync(authFile)) {
    throw new Error(`Arquivo de autenticação "${authFile}" não encontrado. Execute o script "salvar-sessao.js" primeiro.`);
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: authFile });
  const page = await context.newPage();
  const wait = () => page.waitForTimeout(2000); // Manteremos a pausa para visibilidade

  try {
    console.log('🚀 Navegando para o YouTube com a sessão salva...');
    await page.goto('https://www.youtube.com');
    
    // Verificação do pop-up de consentimento
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
    
await page.getByRole('combobox', { name: 'Pesquisar', timeout: 15000 }).fill(videoTitle);

await wait();



await page.getByRole('combobox', { name: 'Pesquisar', timeout: 15000 }).press('Enter');

await wait();



await page.getByRole('button', { name: 'Filtros de enquete', timeout: 15000 }).click();

await wait();



await page.getByRole('link', { name: 'Vídeo', exact: true, timeout: 15000 }).click();

await wait();



await page.getByRole('button', { name: 'Filtros de enquete', timeout: 15000 }).click();

await wait();



await page.getByRole('link', { name: 'a 20 minutos', timeout: 15000 }).click();

await wait();



await page.getByRole('button', { name: 'Filtros de enquete', timeout: 15000 }).click();

await wait();



await page.getByRole('link', { name: 'Última hora', timeout: 15000 }).click();

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



await page.getByRole('button', { name: 'Comentar', timeout: 15000 }).click();

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

const tituloParaTeste = "viagem";

const comentarioParaTeste = "Que vídeo incrível!";


await commentOnYouTubeVideo(tituloParaTeste, comentarioParaTeste, 0);

})();

}