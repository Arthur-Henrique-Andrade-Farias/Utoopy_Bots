const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { commentOnYouTubeVideo } = require('./perfil-chrome/youtubeComment.js');

const app = express();
const PORT = 3000;

const SECRET_API_KEY = 'BOT-YT-ARTHUR-2025-XYZ-987-QWERTY-123';

const apiKeyAuth = (req, res, next) => {
  const providedKey = req.header('x-api-key');
  if (!providedKey) {
    return res.status(401).json({ error: 'Acesso não autorizado. Chave de API não fornecida.' });
  }
  if (providedKey !== SECRET_API_KEY) {
    return res.status(403).json({ error: 'Acesso proibido. Chave de API inválida.' });
  }
  next();
};

app.use(express.json());

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API do Bot de Comentários do YouTube',
    version: '1.0.0',
    description: 'API para acionar um bot e aguardar o resultado.',
  },
  servers: [{ url: `/` }],
  paths: {
    '/api/comment': {
      post: {
        summary: 'Inicia o bot e aguarda o link do vídeo comentado.',
        description: 'Aciona o bot Playwright e espera até 3 minutos pela conclusão. Retorna a URL do vídeo diretamente.',
        parameters: [{ name: 'x-api-key', in: 'header', required: true, schema: { type: 'string' }}],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['videoTitle', 'commentText'],
            properties: {
              videoTitle: { type: 'string', example: 'melhores momentos da rodada' },
              commentText: { type: 'string', example: 'Que golaço!' },
              videoIndex: { type: 'integer', default: 1, example: 1 },
            },
          }}},
        },
        responses: {
          '200': { description: 'Bot executado com sucesso.', content: { 'application/json': { schema: { type: 'object', properties: { finalUrl: { type: 'string' } } } } } },
          '400': { description: 'Erro na requisição. Parâmetros faltando.' },
          '401': { description: 'Acesso não autorizado.'},
          '403': { description: 'Chave de API inválida.'},
          '500': { description: 'Erro interno do servidor ou falha na automação.'}
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/api/comment', apiKeyAuth, async (req, res) => {
  const { videoTitle, commentText, videoIndex } = req.body;

  if (!videoTitle || !commentText) {
    return res.status(400).json({ error: 'Os campos "videoTitle" e "commentText" são obrigatórios.' });
  }

  console.log(`▶️  Iniciando bot para o vídeo: "${videoTitle}". A requisição aguardará a conclusão...`);

  try {
    const finalUrl = await commentOnYouTubeVideo(videoTitle, commentText, videoIndex);
    
    console.log(`✅ Bot finalizou com sucesso. URL: ${finalUrl}`);
    res.status(200).json({ finalUrl: finalUrl });

  } catch (error) {
    console.error(`❌ Bot encontrou um erro na tarefa:`, error.message);
    res.status(500).json({ error: 'Falha na execução da automação.', details: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`🚀 API do Bot do YouTube rodando na porta ${PORT}`);
  console.log(`   📄 Documentação da API disponível em: http://localhost:${PORT}/api-docs`);
});

server.setTimeout(180000);