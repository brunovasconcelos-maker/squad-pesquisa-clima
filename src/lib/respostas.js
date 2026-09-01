import { semente } from './semente.js'
import {
  respostasDe,
  totalDeParticipantes,
  vagasRestantes,
} from './participacao.js'

/*
 * Respostas simuladas.
 *
 * Não há backend coletando nada, então as respostas são inventadas — mas
 * ficam guardadas junto da pesquisa, em `respostas`, e são elas a verdade:
 * a taxa de resposta é o tamanho desta lista sobre o público, calculado na
 * hora de mostrar.
 *
 * Era ao contrário. A taxa era um número guardado que o motor subia sozinho,
 * e um passo de acerto refazia a lista para bater com ela. Isso desfazia
 * exclusões — o que fosse apagado voltava no acerto seguinte, porque a
 * porcentagem não tinha ficado sabendo — e, em público acima de 100 pessoas,
 * apagar uma resposta apagava duas, porque converter para porcentagem e
 * voltar não devolve o mesmo número.
 *
 * Agora quem cresce é a lista: o motor acrescenta gente, apagar tira gente, e
 * ninguém reconcilia nada com uma porcentagem depois.
 */

/* ---- textos por template ---- */

const CURTAS = {
  clima: [
    'Prazos apertados demais',
    'Falta de clareza nas prioridades',
    'Reuniões em excesso',
    'Nada em especial',
    'Time pequeno pro escopo',
    'Mudança de escopo em cima da hora',
    'Ferramentas lentas',
  ],
  feedback: [
    'O tempo para perguntas foi curto',
    'Gostei do formato',
    'A sala estava cheia demais',
    'Nada a apontar',
    'Faltou material para acompanhar',
    'O áudio falhou no começo',
  ],
  solicitacao: [
    'Não sei por onde abrir cada pedido',
    'A documentação está desatualizada',
    'Demora no retorno',
    'Está funcionando bem',
    'Faltou aviso quando o prazo mudou',
  ],
  desligamento: [
    'Falta de perspectiva de crescimento',
    'Desalinhamento com a liderança',
    'Proposta melhor fora',
    'Mudança de área de interesse',
    'Carga de trabalho acima do combinado',
  ],
}

const LONGAS = {
  clima: [
    'O que mais tem ajudado é a autonomia pra decidir como tocar as entregas. Quando as prioridades chegam claras, o time resolve rápido e sem atrito.',
    'Reduziria o número de reuniões recorrentes. Boa parte delas poderia ser uma mensagem, e o tempo picado atrapalha mais do que o volume de trabalho em si.',
    'A colaboração entre as áreas melhorou bastante nos últimos meses. Ainda falta previsibilidade nas mudanças de escopo, que costumam chegar em cima da hora.',
    'Sinto falta de um retorno mais frequente da liderança direta. Não precisa ser formal, só saber se o que estou priorizando é o que se espera.',
    'O clima do time é bom e as pessoas se ajudam. O que pesa é a quantidade de frentes abertas ao mesmo tempo, que faz tudo andar mais devagar do que poderia.',
  ],
  feedback: [
    'A parte de dinâmicas em grupo foi a mais útil. Saí com coisas que dá pra aplicar já na semana que vem, o que nem sempre acontece nesses encontros.',
    'O conteúdo foi bom, mas a duração passou do ponto. Depois da terceira hora fica difícil manter a atenção, e as últimas apresentações se perderam.',
    'Faltou espaço pra perguntas. As apresentações ocuparam quase todo o tempo e as dúvidas ficaram pro corredor.',
    'Organização impecável e material bem preparado. Repetiria e indicaria pra quem não pôde ir dessa vez.',
  ],
  solicitacao: [
    'Os processos funcionam quando a gente já sabe o caminho. O problema é quem chega agora e não tem como descobrir por onde começar sem perguntar pra alguém.',
    'O prazo combinado costuma ser cumprido. O que falha é o aviso quando ele muda — a gente só descobre cobrando.',
    'A documentação interna resolve a maior parte das dúvidas, mas várias páginas estão desatualizadas e levam pro processo antigo.',
    'Sinto apoio das áreas de suporte quando consigo falar com a pessoa certa. Achar a pessoa certa é a parte difícil.',
  ],
  desligamento: [
    'Aprendi bastante no tempo em que estive aqui e saio em bons termos. O que faltou foi uma conversa clara sobre para onde a carreira poderia ir daqui.',
    'A liderança direta foi presente e acessível. A decisão veio mais por uma oportunidade fora do que por algo que tenha acontecido aqui.',
    'As atividades foram mudando bastante em relação ao que a gente tinha combinado na entrada, e isso pesou na decisão.',
    'O processo de entrada foi confuso e demorei pra entender o que se esperava de mim. Depois melhorou, mas a primeira impressão ficou.',
  ],
}

const paraTema = (mapa, template) => mapa[template] || mapa.clima

/*
 * Escolha com peso, guiada pelo hash. As distribuições não são uniformes de
 * propósito: participação real se concentra no meio-alto da escala, e uma
 * escala uniforme deixaria os gráficos com cara de dado sintético.
 */
function sortear(chave, pesos) {
  const soma = pesos.reduce((a, b) => a + b, 0)
  let n = semente(chave) % soma
  for (let i = 0; i < pesos.length; i += 1) {
    if (n < pesos[i]) return i
    n -= pesos[i]
  }
  return pesos.length - 1
}

/* Curva com o pico deslocado para cima: poucas notas baixas, massa no 3-4. */
function pesosDeEscala(quantidade) {
  return Array.from({ length: quantidade }, (_, i) => {
    const posicao = i / Math.max(1, quantidade - 1)
    return Math.round(1 + 20 * Math.exp(-((posicao - 0.72) ** 2) / 0.06))
  })
}

/* As primeiras opções pesam mais: é a ordem em que foram escritas. */
const pesosDeOpcoes = (quantidade) =>
  Array.from({ length: quantidade }, (_, i) => Math.max(1, quantidade - i + 2))

/* Um valor de resposta a partir de uma chave. Exportado porque a tela do
   ciclo gera os dela com a mesma regra, só trocando a chave. */
export function gerarValor(chave, pergunta, template) {
  switch (pergunta.tipo) {
    case 'nota': {
      const passos = (pergunta.maximo ?? 5) + 1
      return sortear(chave, pesosDeEscala(passos))
    }
    case 'estrelas':
      return 1 + sortear(chave, pesosDeEscala(5))
    case 'escolhaUnica':
      return sortear(chave, pesosDeOpcoes(pergunta.opcoes?.length ?? 1))
    case 'escolhaMultipla': {
      const total = pergunta.opcoes?.length ?? 0
      // Uma sempre marcada; as outras entram com um terço de chance cada.
      const marcadas = new Set([sortear(chave, pesosDeOpcoes(total))])
      for (let i = 0; i < total; i += 1) {
        if (semente(`${chave}:${i}`) % 3 === 0) marcadas.add(i)
      }
      return [...marcadas].sort((a, b) => a - b)
    }
    case 'respostaCurta': {
      const pool = paraTema(CURTAS, template)
      return pool[semente(chave) % pool.length]
    }
    case 'respostaLonga': {
      const pool = paraTema(LONGAS, template)
      return pool[semente(chave) % pool.length]
    }
    default:
      return null
  }
}

/* Uma pessoa e tudo o que ela respondeu. O id é estável para a exclusão poder
   apontar para alguém em vez de para uma posição na lista. */
function criarResposta(p, ordem, agora = new Date()) {
  const chaveBase = `${p.id}:r${ordem}`
  return {
    id: `${p.id}_r${ordem}`,
    em: agora.toISOString(),
    valores: Object.fromEntries(
      (p.perguntas || []).map((q) => [
        q.id,
        gerarValor(`${chaveBase}:${q.id}`, q, p.template),
      ]),
    ),
  }
}

/*
 * Acrescenta `quantas` respostas simuladas ao fim da lista. É por aqui que a
 * simulação do motor cresce: gente entrando, e não uma porcentagem subindo.
 *
 * A ordem de cada uma é a posição na lista, e é dela que sai a chave do
 * hash — então quem já está lá nunca muda de conteúdo quando chega mais
 * alguém.
 */
export function crescer(p, quantas, agora = new Date()) {
  const cabem = Math.min(quantas, vagasRestantes(p))
  if (cabem < 1) return p
  const atuais = respostasDe(p)
  const novas = Array.from({ length: cabem }, (_, i) =>
    criarResposta(p, atuais.length + i, agora),
  )
  return { ...p, respostas: [...atuais, ...novas] }
}

/*
 * Converte uma pesquisa guardada no formato antigo, uma vez só.
 *
 * Antes, a participação era uma `taxa` guardada e um `taxaEm` marcando quando
 * ela subiu pela última vez; a lista de respostas só era materializada quando
 * alguém abria o detalhe, e muitas pesquisas não tinham nenhuma. A conversão
 * transforma a taxa velha na lista do tamanho que ela dizia — a pesquisa
 * continua mostrando a mesma porcentagem de antes — e tira os dois campos do
 * registro, deixando o relógio da simulação com o nome que ele tem agora.
 *
 * Lista ausente e lista vazia não são a mesma coisa: `[]` é ninguém ter
 * respondido, ou alguém ter apagado tudo, e nesse caso não há o que
 * materializar.
 */
export function materializar(p, agora = new Date()) {
  if (!p) return p
  const convertida =
    Array.isArray(p.respostas) && p.taxa === undefined && p.taxaEm === undefined
  if (convertida) return p

  const antiga = { ...p, taxa: undefined, taxaEm: undefined }
  if (p.taxaEm && !p.simuladoEm) antiga.simuladoEm = p.taxaEm
  if (Array.isArray(p.respostas)) return antiga

  const quantas = Math.round(
    ((p.taxa ?? 0) / 100) * totalDeParticipantes(p.participantes),
  )
  return crescer({ ...antiga, respostas: [] }, quantas, agora)
}

/*
 * As duas coisas que a lista não pode contrariar.
 *
 * A primeira é o status: uma pesquisa que ainda não saiu — rascunho ou
 * agendada — não tem respostas, e é o que os cartões do Geral dizem.
 *
 * A segunda é o público: mais respostas do que convidados não existe, então
 * um público que encolhe encolhe a lista junto. É a mesma regra que o
 * histórico já aplica a cada ciclo fechado.
 *
 * É a única poda que sobrou, e ela olha o status e o público — nunca uma
 * porcentagem. Nada aqui repõe o que foi apagado.
 */
export function aparar(p) {
  if (!p) return p
  const atuais = respostasDe(p)
  if (p.status === 'rascunho' || p.status === 'agendada') {
    return atuais.length ? { ...p, respostas: [] } : p
  }
  const total = totalDeParticipantes(p.participantes)
  if (atuais.length <= total) return p
  return { ...p, respostas: atuais.slice(0, total) }
}

/* Uma resposta de verdade, enviada pela vista de quem responde. Entra na
   mesma lista das simuladas, no fim, e a taxa sobe sozinha porque é contada
   dela. */
export function adicionarResposta(p, valores, agora = new Date()) {
  return {
    ...p,
    respostas: [
      ...respostasDe(p),
      {
        id: `${p.id}_r${agora.getTime().toString(36)}`,
        em: agora.toISOString(),
        valores,
      },
    ],
  }
}

/* Apagar é só tirar da lista. Nada recalcula, nada repõe: a taxa cai porque
   ela é a contagem desta lista. */
export function removerResposta(p, idResposta) {
  return { ...p, respostas: respostasDe(p).filter((r) => r.id !== idResposta) }
}

export function limparRespostas(p) {
  return { ...p, respostas: [] }
}

/* ---- leitura ---- */

/* O que a pessoa respondeu numa pergunta, no formato que CorpoDaResposta lê. */
export function valorDe(resposta, pergunta) {
  if (!resposta || !pergunta) return null
  const valor = resposta.valores?.[pergunta.id]
  if (valor === undefined || valor === null) return null
  return { tipo: pergunta.tipo, valor }
}

/* ---- arquivos ---- */

/* Como a resposta aparece no arquivo: o texto, não o índice. */
function paraTexto(pergunta, valor) {
  if (valor === undefined || valor === null) return ''
  switch (pergunta.tipo) {
    case 'escolhaUnica':
      return pergunta.opcoes?.[valor] ?? ''
    case 'escolhaMultipla':
      return (valor || []).map((i) => pergunta.opcoes?.[i] ?? '').join('; ')
    case 'estrelas':
      return `${valor} de 5`
    case 'nota':
      return `${valor} de ${pergunta.maximo ?? 5}`
    default:
      return String(valor)
  }
}

/* Aspas dobradas e campo entre aspas: o suficiente para os textos livres, que
   têm vírgula e podem ter quebra de linha. */
const celula = (t) => `"${String(t).replaceAll('"', '""')}"`

export function paraCsv(p, respostas) {
  const perguntas = p.perguntas || []
  const cabecalho = ['Resposta', ...perguntas.map((q) => q.enunciado)]
  const linhas = respostas.map((r, i) => [
    `Resposta ${i + 1}`,
    ...perguntas.map((q) => paraTexto(q, r.valores?.[q.id])),
  ])
  // BOM na frente: sem ele o Excel abre os acentos errados.
  return `﻿${[cabecalho, ...linhas].map((l) => l.map(celula).join(',')).join('\r\n')}\r\n`
}

/* Nome de arquivo a partir do nome da pesquisa, sem acento nem espaço. */
export function nomeDeArquivo(p, sufixo) {
  const base = (p.nome || 'pesquisa')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return `${base}-${sufixo}.csv`
}

export function baixar(nome, conteudo) {
  const url = URL.createObjectURL(
    new Blob([conteudo], { type: 'text/csv;charset=utf-8' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Solta o blob depois do clique; antes disso o download ainda não começou.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
