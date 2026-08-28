import { semente, totalDeParticipantes } from './geral.js'

/*
 * Respostas simuladas.
 *
 * Não há backend coletando nada, então as respostas são inventadas — mas
 * ficam guardadas junto da pesquisa, em `respostas`, e não recalculadas a
 * cada render. É o que permite deletar uma e ela continuar deletada.
 *
 * Quantas existem acompanha a taxa que o motor sobe: `sincronizar` acrescenta
 * as que faltam e nunca mexe nas que já estão lá. Deletar mexe nos dois lados
 * — tira da lista e baixa a taxa —, senão a próxima sincronização traria de
 * volta quem acabou de sair, e a rosca do Geral discordaria da contagem daqui.
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

function responder(chave, pergunta, template) {
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
function criarResposta(p, ordem) {
  const chaveBase = `${p.id}:r${ordem}`
  return {
    id: `${p.id}_r${ordem}`,
    em: new Date().toISOString(),
    valores: Object.fromEntries(
      (p.perguntas || []).map((q) => [
        q.id,
        responder(`${chaveBase}:${q.id}`, q, p.template),
      ]),
    ),
  }
}

/*
 * Acerta a lista guardada com a taxa que o motor sobe: acrescenta o que
 * faltar, mantém o que já existe. Devolve a própria pesquisa quando não há
 * nada a fazer, para quem chama saber que não precisa gravar.
 */
export function sincronizar(p) {
  if (!p) return p
  const atuais = p.respostas || []
  if (p.status === 'rascunho' || p.status === 'agendada') {
    return atuais.length ? { ...p, respostas: [] } : p
  }

  const alvo = Math.round(
    ((p.taxa ?? 0) / 100) * totalDeParticipantes(p.participantes),
  )
  if (alvo === atuais.length) return p
  if (alvo < atuais.length) return { ...p, respostas: atuais.slice(0, alvo) }

  const novas = Array.from({ length: alvo - atuais.length }, (_, i) =>
    criarResposta(p, atuais.length + i),
  )
  return { ...p, respostas: [...atuais, ...novas] }
}

/* Sobra da taxa depois de mexer na lista: a rosca do Geral e a contagem daqui
   contam a mesma coisa, então uma não pode andar sem a outra. */
const comTaxaDaLista = (p, respostas) => ({
  ...p,
  respostas,
  taxa: Math.round(
    (respostas.length / totalDeParticipantes(p.participantes)) * 100,
  ),
})

export function removerResposta(p, idResposta) {
  return comTaxaDaLista(
    p,
    (p.respostas || []).filter((r) => r.id !== idResposta),
  )
}

export function limparRespostas(p) {
  return comTaxaDaLista(p, [])
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
