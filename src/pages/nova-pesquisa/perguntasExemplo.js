/*
 * Conteúdo de exemplo da tela de revisão, tirado do Figma (8065:4915).
 *
 * O nó desenha 10 perguntas repetindo tipos; aqui ficou uma de cada um dos
 * seis tipos suportados, na ordem em que foram especificados.
 *
 * Os textos vêm literais do Figma, incluindo os tis que faltam em "Nao" e
 * "avaliaçao" — são do mock, não da nossa digitação.
 */
export const PERGUNTAS_EXEMPLO = [
  {
    tipo: 'nota',
    enunciado:
      'De 0 a 5, o quanto você recomendaria o time de design como um bom lugar pra trabalhar?',
    pontaEsquerda: 'Nao recomendaria',
    pontaDireita: 'Recomendaria',
  },
  {
    tipo: 'escolhaUnica',
    enunciado: 'Você se sente confortável dando feedback para sua liderança?',
    opcoes: ['Muito confortável', 'Pouco confortável', 'Nao dou feedback'],
  },
  {
    tipo: 'escolhaMultipla',
    enunciado: 'Como você avalia sua carga de trabalho atual?',
    opcoes: ['Muito leve', 'Leve', 'Equilibrada', 'Pesada', 'Muito pesada'],
  },
  {
    tipo: 'respostaCurta',
    enunciado: 'Existe algo específico dificultando seu trabalho hoje?',
  },
  {
    tipo: 'respostaLonga',
    enunciado: 'O que mais tem impactado positivamente seu trabalho ultimamente?',
  },
  {
    tipo: 'estrelas',
    enunciado: 'Qual sua avaliaçao final pro time de design como um todo?',
  },
]

export const ABERTURA_TEMPLATE =
  'Essa pesquisa quer entender como está o clima do time de design. Leva cerca de 12 minutos e suas respostas ajudam a melhorar o dia a dia do time.'

export const ABERTURA_BRANCO =
  'Escreva aqui um texto de introdução explicando o objetivo da pesquisa e como as respostas serão usadas. Isso ajuda a aumentar a taxa de resposta.'
