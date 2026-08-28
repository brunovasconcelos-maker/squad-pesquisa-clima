/*
 * Registro de alterações nas perguntas.
 *
 * A coluna "Atividade" do Histórico dizia "Sofreu N alterações" a partir de um
 * hash. Agora vem daqui: cada edição, exclusão ou inclusão de pergunta — e
 * cada mudança na abertura — entra num registro, guardado junto da pesquisa e
 * separado por ciclo.
 *
 * A que ciclo uma alteração pertence:
 *
 *  - Rodando ou pausada, o ciclo `ciclos` está aberto e a alteração é dele.
 *    Pausada é o caso normal, porque a aba Perguntas exige pausar antes de
 *    editar: quem edita interrompeu o ciclo em curso, e é esse que sofreu a
 *    alteração.
 *  - Aguardando, encerrada, agendada ou rascunho, não há ciclo aberto: o que
 *    se edita agora vale para o próximo, `ciclos + 1`.
 *
 * O registro fica no formato { "3": [...], "4": [...] } para uma alteração
 * nunca migrar de ciclo depois de anotada.
 */

const COM_CICLO_ABERTO = ['rodando', 'naoAtiva']

export function cicloEmAberto(p) {
  const atual = p.ciclos ?? 0
  if (COM_CICLO_ABERTO.includes(p.status) && atual >= 1) return atual
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
