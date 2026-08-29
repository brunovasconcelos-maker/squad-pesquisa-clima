/*
 * Registro de alterações nas perguntas.
 *
 * A coluna "Atividade" do Histórico dizia "Sofreu N alterações" a partir de um
 * hash. Agora vem daqui: cada edição, exclusão ou inclusão de pergunta — e
 * cada mudança na abertura — entra num registro, guardado junto da pesquisa e
 * separado por ciclo.
 *
 * A que ciclo uma alteração pertence: só "rodando" tem ciclo aberto, e a
 * alteração é dele. Em qualquer outro status — aguardando, não ativa,
 * encerrada, agendada ou rascunho — o ciclo `ciclos` já fechou e está no
 * Histórico com as datas e a taxa dele; o que se edita agora vale para o
 * próximo, `ciclos + 1`.
 *
 * É a mesma conta de `ciclosFechados`, e tem de ser: anotar uma alteração num
 * ciclo que a tabela já mostra como encerrado diria que ele mudou depois de
 * ter acabado.
 *
 * O registro fica no formato { "3": [...], "4": [...] } para uma alteração
 * nunca migrar de ciclo depois de anotada.
 */

export function cicloEmAberto(p) {
  const atual = p.ciclos ?? 0
  if (p.status === 'rodando' && atual >= 1) return atual
  return atual + 1
}

/* Anota uma alteração e devolve a pesquisa. `alvo` é o enunciado da pergunta,
   ou o rótulo do que mudou quando não há uma. */
export function registrar(p, tipo, alvo) {
  const numero = String(cicloEmAberto(p))
  const registro = p.alteracoes || {}
  const doCiclo = registro[numero] || []
  return {
    ...p,
    alteracoes: {
      ...registro,
      [numero]: [...doCiclo, { em: new Date().toISOString(), tipo, alvo }],
    },
  }
}

export const alteracoesDoCiclo = (p, numero) =>
  (p.alteracoes || {})[String(numero)] || []

/* Frase da coluna Atividade. Vazia quando o ciclo passou sem mexerem nele —
   o Figma deixa a célula em branco nesse caso. */
export function fraseDeAtividade(quantas) {
  if (!quantas) return ''
  return `Sofreu ${quantas} ${quantas === 1 ? 'alteração' : 'alterações'}`
}
