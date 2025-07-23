// 1. IMPORTAR A FUNÇÃO
// A linha abaixo importa a função 'commentOnYouTubeVideo' do seu outro arquivo.
// O caminho './perfil-chrome/youtubeComment.js' é relativo a onde este arquivo está.
const { commentOnYouTubeVideo } = require('./perfil-chrome/youtubeComment.js');

// 2. DEFINIR OS PARÂMETROS
// Você pode criar uma lista de tarefas para o bot.
const tarefas = [
  {
    titulo: "melhores lances brasileirão 2024",
    comentario: "Que jogada espetacular!",
    videoIndex: 1 // Clica no PRIMEIRO vídeo
  },
  {
    titulo: "review placa de video rtx 5090",
    comentario: "Ótimo review, muito informativo.",
    videoIndex: 1 // Clica no SEGUNDO vídeo
  },
  {
    titulo: "como fazer pão caseiro",
    comentario: "Vou testar essa receita hoje mesmo!",
    videoIndex: 1 // Clica no PRIMEIRO vídeo
  }
];

// 3. EXECUTAR AS TAREFAS EM SEQUÊNCIA
// Usamos uma estrutura async para poder usar 'await'.
(async () => {
  console.log('🤖 === INICIANDO BOT DE COMENTÁRIOS === 🤖');

  // O laço 'for...of' garante que cada comentário seja feito um após o outro.
  for (const tarefa of tarefas) {
    console.log(`\n▶️  Iniciando tarefa: Comentar no vídeo sobre "${tarefa.titulo}"`);
    
    // Chama a função importada, passando os parâmetros da tarefa atual
    await commentOnYouTubeVideo(tarefa.titulo, tarefa.comentario, tarefa.videoIndex);
    
    console.log(`✅ Tarefa finalizada com sucesso!`);
  }

  console.log('\n🎉 === TODAS AS TAREFAS FORAM CONCLUÍDAS === 🎉');
})();