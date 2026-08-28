import { entre, semente } from './geral.js'
import { formatarMedio, proximoCiclo, somarDias } from './datas.js'
import { ehRecorrente } from './pesquisas.js'

/*
 * Ciclos já encerrados de uma pesquisa.
 *
 * Simulado. O motor não guarda histórico — ele carrega um ciclo por vez e o
 * anterior só sobrevive em `anterior`, com a taxa e as datas. O que falta
 * (alterações nas perguntas, encerramento antes do prazo) só existirá quando
 * a aba Perguntas passar a registrar, que é um passo à parte.
 *
 * O que não é simulado é quantos ciclos existem e a numeração deles: sai de
 * `ciclos`, o mesmo número que o cartão do Geral mostra. O ciclo em curso
 * nunca entra — a lista é do que já fechou.
 *
 * Datas e taxas são presas ao id, como o resto do simulado do projeto, então
 * não dançam entre visitas.
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

export function historicoDe(p) {
  const quantos = ciclosFechados(p)
  if (!quantos) return []

  const inicios = iniciosAnteriores(p, quantos)

  return inicios.map((inicio, passo) => {
    const numero = quantos - passo
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
    const duracao = cedo ? 2 : 7
    const fim = somarDias(inicio, duracao)

    /* Alterações nas perguntas durante o ciclo. */
    const alteracoes = semente(`${chave}:alt`) % 3 === 0 ? 1 : 0

    return {
      id: `${p.id}_c${numero}`,
      numero,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      envio: formatarMedio(inicio.toISOString()),
      encerrado: formatarMedio(fim.toISOString()),
      taxa,
      cedo,
      alteracoes,
    }
  })
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
