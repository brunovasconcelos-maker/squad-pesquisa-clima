import { entre, semente } from './semente.js'
import { totalDeParticipantes } from './participacao.js'
import { formatarMedio, formatarPeriodo, proximoCiclo, somarDias } from './datas.js'
import { ehRecorrente } from './pesquisas.js'
import { gerarValor } from './respostas.js'
import { alteracoesDoCiclo } from './alteracoes.js'

/*
 * Ciclos já encerrados de uma pesquisa.
 *
 * Simulado — o motor não guarda histórico, ele carrega um ciclo por vez —, mas
 * guardado: cada ciclo entra em `historico` com as perguntas como estavam
 * naquele momento e as respostas daquele ciclo. Sem isso, editar uma pergunta
 * hoje reescreveria o que foi perguntado há três meses, e apagar as respostas
 * de um ciclo não duraria até o próximo render.
 *
 * `sincronizar` só acrescenta o que falta e nunca mexe no que já está lá. É a
 * mesma regra das respostas do ciclo em curso, pelo mesmo motivo.
 *
 * O que não é simulado é quantos ciclos existem e a numeração deles: sai de
 * `ciclos`, o mesmo número que o cartão do Geral mostra. O ciclo em curso
 * nunca entra — a lista é do que já fechou.
 */

/* Quantos ciclos já fecharam: todos menos o que está rodando agora. */
export function ciclosFechados(p) {
  const total = p.ciclos ?? 0
  return p.status === 'rodando' ? Math.max(0, total - 1) : total
}

/*
 * Anda para trás a partir do início do ciclo atual, um passo de frequência
 * por ciclo. Única não recorre, então cai no passo de um mês só para as datas
 * não empilharem no mesmo dia.
 */
function iniciosAnteriores(p, quantos) {
  const base = p.cicloInicio ? new Date(p.cicloInicio) : new Date()
  const frequencia = ehRecorrente(p) ? p.configuracao?.frequencia : 'Mensal'
  const datas = []
  let atual = base
  for (let i = 0; i < quantos; i += 1) {
    // proximoCiclo anda para a frente; para trás é o mesmo salto invertido.
    const seguinte = proximoCiclo(atual, frequencia)
    const salto = seguinte - atual
    atual = new Date(atual.getTime() - salto)
    datas.push(atual)
  }
  return datas
}

/* Um ciclo novo: datas, taxa, o retrato das perguntas e as respostas dele. */
function criarCiclo(p, numero, inicio) {
  const chave = `${p.id}:ciclo${numero}`

  /* Uma faixa por ciclo, espalhadas pela escala de cor em vez de todas na
     mesma. O resto sai do hash. */
  const faixas = [
    [82, 100],
    [70, 79],
    [22, 45],
    [88, 100],
    [60, 78],
  ]
  const [min, max] = faixas[numero % faixas.length]
  const taxa = entre(`${chave}:taxa`, min, max)

  /* Encerrado antes do prazo: a pesquisa foi pausada no meio do ciclo.
     Acontece em um a cada quatro, e aí o ciclo dura 2 dias em vez do prazo
     inteiro. */
  const cedo = semente(`${chave}:cedo`) % 4 === 0
  const fim = somarDias(inicio, cedo ? 2 : 7)

  /* O retrato das perguntas: cópia, não referência. Editar a pesquisa depois
     não pode mudar o que foi perguntado neste ciclo. */
  const perguntas = (p.perguntas || []).map((q) => ({ ...q }))

  /* Convidados são o público da pesquisa, o mesmo número que o cartão do
     Geral usa. Um fixo aqui fazia as duas telas contarem sobre bases
     diferentes: "29 de 32" de um lado, "17 de 56" do outro. */
  const convidados = totalDeParticipantes(p.participantes)
  const responderam = Math.round((taxa / 100) * convidados)
  const respostas = Array.from({ length: responderam }, (_, i) => ({
    id: `${p.id}_c${numero}_r${i}`,
    valores: Object.fromEntries(
      perguntas.map((q) => [
        q.id,
        gerarValor(`${chave}:r${i}:${q.id}`, q, p.template),
      ]),
    ),
  }))

  return {
    id: `${p.id}_c${numero}`,
    numero,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    taxa,
    cedo,
    convidados,
    perguntas,
    respostas,
  }
}

/*
 * Acerta o histórico guardado com quantos ciclos já fecharam. Devolve a
 * própria pesquisa quando não há nada a fazer, para quem chama saber que não
 * precisa gravar.
 *
 * Acerta também o público de cada ciclo. Ele é da pesquisa, não do ciclo:
 * mudou o público — ou o ciclo veio de quando o histórico usava um número
 * fixo —, a taxa dele passa a contar sobre o público de verdade.
 *
 * Só o denominador muda, e a lista de respostas nunca cresce aqui: apagar as
 * de um ciclo continua durando. Ela só encolhe quando passou a ter mais
 * respostas do que convidados, que é uma conta que não existe.
 */
export function sincronizarHistorico(p) {
  if (!p) return p
  const quantos = ciclosFechados(p)
  const publico = totalDeParticipantes(p.participantes)
  const atuais = p.historico || []

  /* Mais respostas que convidados não existe: quando o público encolhe, a
     lista do ciclo encolhe junto, senão a tabela diria 180%. */
  const comPublico = (c) => {
    const respostas = c.respostas || []
    const cabem = respostas.length > publico ? respostas.slice(0, publico) : respostas
    if (c.convidados === publico && cabem === respostas) return c
    return { ...c, convidados: publico, respostas: cabem }
  }

  if (quantos <= atuais.length) {
    // Perdeu ciclos (uma cópia, por exemplo): fica com os mais antigos.
    const cortados = atuais.slice(atuais.length - quantos)
    const acertados = cortados.map(comPublico)
    const igual =
      acertados.length === atuais.length && acertados.every((c, i) => c === atuais[i])
    return igual ? p : { ...p, historico: acertados }
  }

  const inicios = iniciosAnteriores(p, quantos)
  const novos = []
  for (let passo = 0; passo < quantos; passo += 1) {
    const numero = quantos - passo
    const guardado = atuais.find((c) => c.numero === numero)
    novos.push(guardado ? comPublico(guardado) : criarCiclo(p, numero, inicios[passo]))
  }
  return { ...p, historico: novos }
}

/* A lista para a tabela, do mais novo para o mais velho, já com as datas
   escritas do jeito que a tela mostra. */
export function historicoDe(p) {
  return (p.historico || []).map((c) => ({
    ...c,
    envio: formatarMedio(c.inicio),
    encerrado: formatarMedio(c.fim),
    taxa: taxaDoCiclo(c),
    /* Contado do registro de alterações, não guardado no ciclo: quem edita
       hoje uma pesquisa cujo ciclo ainda não fechou precisa ver o número
       subir quando ele fechar. */
    alteracoes: alteracoesDoCiclo(p, c.numero).length,
  }))
}

/*
 * Os ciclos fechados como o cartão "Taxa de resposta anterior" do Geral
 * precisa deles: do mais novo para o mais velho, cada um já com o rótulo do
 * seletor e as frases do cartão.
 *
 * Só entram os de número menor que `ciclos`: o ciclo `ciclos` é o que o
 * cartão de cima já mostra — em curso quando está rodando, o último quando a
 * pesquisa está entre ciclos —, e os dois cartões não podem falar do mesmo.
 *
 * Os números são os do próprio ciclo, que são os mesmos que a tabela do
 * Histórico conta — e o público é o da pesquisa, o mesmo do cartão de cima.
 */
export function taxasAnteriores(p) {
  if (!ehRecorrente(p)) return []
  const publico = totalDeParticipantes(p.participantes)
  return historicoDe(p)
    .filter((c) => c.numero < (p.ciclos ?? 0))
    .sort((a, b) => b.numero - a.numero)
    .map((c) => ({
      numero: c.numero,
      titulo: 'Taxa de resposta anterior',
      periodo: formatarPeriodo(c.inicio),
      taxa: c.taxa,
      principal: `${c.respostas?.length ?? 0} de ${c.convidados ?? publico} responderam essa pesquisa.`,
      apoio: `Encerrada em ${formatarMedio(c.fim)}`,
    }))
}

/* A taxa que a tabela mostra vem das respostas guardadas, não do número que
   sorteou o ciclo: apagar as respostas tem de derrubar a taxa junto, senão a
   linha do Histórico diria 71% para um ciclo com zero respostas. */
export function taxaDoCiclo(ciclo) {
  const convidados = ciclo.convidados || 0
  if (!convidados) return 0
  return Math.round(((ciclo.respostas?.length ?? 0) / convidados) * 100)
}

/* ---- ordenação ---- */

export const COLUNAS = [
  { id: 'numero', nome: 'Ciclo', ordenavel: true },
  { id: 'inicio', nome: 'Data de Envio', ordenavel: true },
  { id: 'fim', nome: 'Encerrado em', ordenavel: true },
  { id: 'taxa', nome: 'Taxa de Resposta', ordenavel: true },
  { id: 'atividade', nome: 'Atividade', ordenavel: false },
]

/* Datas comparam como texto ISO, que já ordena certo; número compara como
   número. Sem localeCompare porque nenhuma coluna ordenável é texto livre. */
export function ordenar(ciclos, coluna, crescente) {
  const sinal = crescente ? 1 : -1
  return [...ciclos].sort((a, b) => {
    const x = a[coluna]
    const y = b[coluna]
    if (x === y) return 0
    return (x > y ? 1 : -1) * sinal
  })
}
