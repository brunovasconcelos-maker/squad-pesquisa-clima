import VistaResposta, { usePesquisaDaVista } from './VistaResposta.jsx'
import s from './Responder.module.css'

/*
 * Tela final (Figma 8082:8325). O texto do cartão é a mensagem final que a
 * pesquisa tem configurada; abaixo dele vem a ilustração do Pipo.
 *
 * Sem botão nenhum: acabou.
 */
export default function TelaFim() {
  const pesquisa = usePesquisaDaVista()
  const mostrarProgresso = Boolean(pesquisa.configuracao?.avancadas?.barraProgresso)

  return (
    <VistaResposta pesquisa={pesquisa} progresso={mostrarProgresso ? 1 : null}>
      <section className={`${s.cartao} ${s.cartaoCentrado}`}>
        <h1 className={s.nome}>Sua resposta foi enviada!</h1>
        <p className={s.paragrafo}>{pesquisa.configuracao?.mensagemFinal}</p>
      </section>

      {/* Falta a ilustração do Pipo na espreguiçadeira em src/assets/images —
          a única do projeto é a Pipo-Loading, que é outro desenho. O vão de
          580x324 do Figma fica reservado para o arquivo entrar no lugar. */}
      <div className={s.vaoDaIlustracao} aria-hidden="true" />
    </VistaResposta>
  )
}
