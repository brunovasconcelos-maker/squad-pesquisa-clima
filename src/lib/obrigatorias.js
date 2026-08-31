/*
 * Se uma pergunta é obrigatória.
 *
 * São duas camadas: o padrão da pesquisa — "Tornar as perguntas obrigatórias
 * por padrão", nas configurações avançadas — e a marcação de cada pergunta,
 * no interruptor do próprio cartão.
 *
 * A da pergunta ganha quando existe. É o que faz o padrão ser padrão e não
 * trava: ele vale para quem nunca foi mexida, e mexer numa não a prende ao
 * que a pesquisa diz. Por isso `obrigatoria` só existe depois que alguém
 * mexeu — `undefined` é "siga o padrão", e não "não é obrigatória".
 */
export function ehObrigatoria(pergunta, pesquisa) {
  return Boolean(
    pergunta?.obrigatoria ?? pesquisa?.configuracao?.avancadas?.obrigatorias,
  )
}

export function temObrigatorias(pesquisa) {
  return (pesquisa?.perguntas || []).some((q) => ehObrigatoria(q, pesquisa))
}

/* Marca ou desmarca uma pergunta, sempre gravando o valor: a partir daqui ela
   deixa de seguir o padrão da pesquisa. */
export function alternarObrigatoria(pesquisa, idPergunta) {
  return {
    ...pesquisa,
    perguntas: (pesquisa.perguntas || []).map((q) =>
      q.id === idPergunta ? { ...q, obrigatoria: !ehObrigatoria(q, pesquisa) } : q,
    ),
  }
}
