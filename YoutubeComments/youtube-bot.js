const { commentOnYouTubeVideo } = require('./youtubeComment.js');

const tarefas = [
  {
    titulo: "melhores lances brasileirão 2024",
    comentario: "Que jogada espetacular!",
    videoIndex: 1 
  },
  {
    titulo: "review placa de video rtx 5090",
    comentario: "Ótimo review, muito informativo.",
    videoIndex: 1 
  },
  {
    titulo: "como fazer pão caseiro",
    comentario: "Vou testar essa receita hoje mesmo!",
    videoIndex: 1 
  }
];

(async () => {
  console.log('🤖 === INICIANDO BOT DE COMENTÁRIOS === 🤖');

  for (const tarefa of tarefas) {
    console.log(`\n▶️  Iniciando tarefa: Comentar no vídeo sobre "${tarefa.titulo}"`);
    
    await commentOnYouTubeVideo(tarefa.titulo, tarefa.comentario, tarefa.videoIndex);
    
    console.log(`✅ Tarefa finalizada com sucesso!`);
  }

  console.log('\n🎉 === TODAS AS TAREFAS FORAM CONCLUÍDAS === 🎉');
})();