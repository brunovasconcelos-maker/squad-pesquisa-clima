import { CAPA_PADRAO } from '../../lib/capa.js'
import { MENSAGEM_FINAL_PADRAO } from '../nova-pesquisa/estado.jsx'
import { ABERTURA_TEMPLATE } from '../nova-pesquisa/perguntasExemplo.js'

/*
 * A pesquisa que a vista de quem responde mostra quando o id da URL não
 * existe no localStorage.
 *
 * Serve para ver as telas sem precisar criar uma pesquisa antes, e é o
 * conteúdo do Figma (8073:7375 e 8073:7467). Quando o id existe, quem manda é
 * a pesquisa guardada: nome, abertura, capa, perguntas e mensagem final saem
 * de lá.
 */
export const PESQUISA_EXEMPLO = {
  id: 'exemplo',
  nome: 'Feedback time de Design',
  abertura: ABERTURA_TEMPLATE,
  capa: CAPA_PADRAO,
  perguntas: [
    {
      id: 1,
      tipo: 'nota',
      maximo: 5,
      enunciado:
        'De 0 a 5, o quanto você recomendaria o time de design como um bom lugar pra trabalhar?',
      pontaEsquerda: 'Nao recomendaria',
      pontaDireita: 'Recomendaria',
    },
    {
      id: 2,
      tipo: 'escolhaUnica',
      enunciado: 'Com que frequência você recebe retorno sobre o seu trabalho?',
      opcoes: ['Toda semana', 'A cada duas semanas', 'Uma vez por mês', 'Quase nunca'],
    },
    {
      id: 3,
      tipo: 'escolhaMultipla',
      enunciado: 'O que mais atrapalha o seu dia a dia?',
      opcoes: [
        'Reuniões demais',
        'Prioridades que mudam',
        'Falta de contexto do produto',
        'Ferramentas',
      ],
      temOutro: true,
    },
    {
      id: 4,
      tipo: 'estrelas',
      enunciado: 'Como você avalia a colaboração entre design e engenharia?',
    },
    {
      id: 5,
      tipo: 'respostaLonga',
      enunciado: 'O que você mudaria no time se pudesse mudar uma coisa só?',
    },
  ],
  configuracao: {
    respostasAnonimas: true,
    mensagemFinal: MENSAGEM_FINAL_PADRAO,
    avancadas: { barraProgresso: true, obrigatorias: true },
  },
}

/* O e-mail é do Figma e é decorativo: não há login nesta vista. */
export const EMAIL_EXEMPLO = 'bruno@inner.ai'
