import VistaResposta from './VistaResposta.jsx'
import { useResposta } from './RespostaProvider.jsx'
import s from './Responder.module.css'

/* O nome do arquivo é o da layer do Figma, como manda a convenção do
   projeto — é o @2x da caixa de 580x324 da tela. */
import pipo from '../../assets/images/7T7nCfyZ97uiZuW6Yue_3_VWS87PuS 1@2x.png'

/*
 * Tela final (Figma 8082:8325). O texto do cartão é a mensagem final que a
 * pesquisa tem configurada; abaixo dele vem a ilustração do Pipo.
 *
 * Sem botão nenhum: acabou.
 */
export default function TelaFim() {
  const { pesquisa, mostrarProgresso } = useResposta()

  return (
    <VistaResposta pesquisa={pesquisa} progresso={mostrarProgresso ? 1 : null}>
      <section className={`${s.cartao} ${s.cartaoCentrado}`}>
        <h1 className={s.nome}>Sua resposta foi enviada!</h1>
        <p className={s.paragrafo}>{pesquisa.configuracao?.mensagemFinal}</p>
      </section>

      <img
        className={s.ilustracao}
        src={pipo}
        alt="Pipo descansando numa espreguiçadeira"
        width={580}
        height={324}
      />
    </VistaResposta>
  )
}
