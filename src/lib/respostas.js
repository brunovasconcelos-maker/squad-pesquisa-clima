import { entre, semente } from './geral.js'

/*
 * Respostas de exemplo.
 *
 * Não há backend coletando nada: as respostas aqui são inventadas, uma por
 * pessoa e por pergunta, e presas ao id da pesquisa — o mesmo hash que a aba
 * Geral usa para os números simulados. Assim elas não mudam a cada render nem
 * a cada visita, que é o mínimo para a tela poder ser lida.
 *
 * Quantas existem sai de `totalDeRespostas`, que é o mesmo número que a rosca
 * do Geral mostra: as duas abas falam da mesma pesquisa e não podem discordar.
 */

/* Textos de exemplo para as perguntas abertas. */
const CURTAS = [
  'Prazos apertados demais',
  'Falta de clareza nas prioridades',
  'Nada em especial',
  'Reuniões em excesso',
  'Ferramentas lentas',
  'Time pequeno pro escopo',
]

const LONGAS = [
  'O que mais tem ajudado é a autonomia pra decidir como tocar as entregas. Quando as prioridades chegam claras, o time resolve rápido e sem atrito.',
  'Reduziria o número de reuniões recorrentes. Boa parte delas poderia ser uma mensagem, e o tempo picado atrapalha mais do que o volume de trabalho em si.',
  'A colaboração entre as áreas melhorou bastante nos últimos meses. Ainda falta previsibilidade nas mudanças de escopo, que costumam chegar em cima da hora.',
  'Sinto falta de um retorno mais frequente da liderança direta. Não precisa ser formal, só saber se o que estou priorizando é o que se espera.',
]

/*
 * A resposta de uma pessoa a uma pergunta. Determinística: mesma pesquisa,
 * mesma pessoa e mesma pergunta dão sempre o mesmo valor.
 */
export function respostaDe(pesquisa, indicePessoa, pergunta) {
  const chave = `${pesquisa.id}:${indicePessoa}:${pergunta.id}`

  switch (pergunta.tipo) {
    case 'nota':
      return { tipo: 'nota', valor: entre(chave, 0, pergunta.maximo ?? 5) }
    case 'estrelas':
      return { tipo: 'estrelas', valor: entre(chave, 1, 5) }
    case 'escolhaUnica':
      return {
        tipo: 'escolhaUnica',
        valor: entre(chave, 0, (pergunta.opcoes?.length ?? 1) - 1),
      }
    case 'escolhaMultipla': {
      // Pelo menos uma marcada, senão não seria uma resposta.
      const total = pergunta.opcoes?.length ?? 0
      const marcadas = new Set([entre(chave, 0, Math.max(0, total - 1))])
      for (let i = 0; i < total; i += 1) {
        if (semente(`${chave}:${i}`) % 3 === 0) marcadas.add(i)
      }
      return { tipo: 'escolhaMultipla', valor: [...marcadas].sort((a, b) => a - b) }
    }
    case 'respostaCurta':
      return { tipo: 'respostaCurta', valor: CURTAS[semente(chave) % CURTAS.length] }
    case 'respostaLonga':
      return { tipo: 'respostaLonga', valor: LONGAS[semente(chave) % LONGAS.length] }
    default:
      return null
  }
}

/* Todas as respostas de uma pessoa, na ordem das perguntas. */
export function respostasDaPessoa(pesquisa, indicePessoa) {
  return (pesquisa.perguntas || []).map((pergunta) => ({
    pergunta,
    resposta: respostaDe(pesquisa, indicePessoa, pergunta),
  }))
}
