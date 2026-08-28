/*
 * Se uma pergunta é obrigatória.
 *
 * Ainda não há marcação por pergunta — o que existe é o padrão da pesquisa,
 * "Tornar as perguntas obrigatórias por padrão", nas configurações. Ler o
 * campo da pergunta primeiro deixa o dia em que ele existir resolvido sem
 * mexer nas telas.
 */
export function ehObrigatoria(pergunta, pesquisa) {
  return Boolean(
    pergunta?.obrigatoria ?? pesquisa.configuracao?.avancadas?.obrigatorias,
  )
}

export function temObrigatorias(pesquisa) {
  return (pesquisa.perguntas || []).some((q) => ehObrigatoria(q, pesquisa))
}
