import Botao from '../../components/fluxo/Botao.jsx'
import VistaResposta, { usePesquisaDaVista } from './VistaResposta.jsx'
import { EMAIL_EXEMPLO } from './exemplo.js'
import { temObrigatorias } from './obrigatorias.js'
import s from './Responder.module.css'

import eyeClosed from '../../assets/icons/EyeClosed.svg'

/*
 * Primeira tela de quem responde (Figma 8073:7375).
 *
 * O e-mail e o "Mudar conta" são decorativos: não há login nesta vista, e o
 * link não leva a lugar nenhum ainda.
 */
export default function TelaAbertura() {
  const pesquisa = usePesquisaDaVista()
  const anonimas = Boolean(pesquisa.configuracao?.respostasAnonimas)
  const mostrarProgresso = Boolean(pesquisa.configuracao?.avancadas?.barraProgresso)

  return (
    <VistaResposta pesquisa={pesquisa} progresso={mostrarProgresso ? 0 : null}>
      <section className={s.cartao}>
        <h1 className={s.nome}>{pesquisa.nome}</h1>
        <p className={s.paragrafo}>{pesquisa.abertura}</p>

        <p className={s.paragrafo}>
          Você está respondendo como: <strong className={s.email}>{EMAIL_EXEMPLO}</strong>{' '}
          <span className={s.mudarConta}>Mudar conta</span>
        </p>

        {anonimas ? (
          <div className={s.linhaAnonima}>
            <img
              className={s.iconeAnonimo}
              src={eyeClosed}
              alt=""
              width={24}
              height={24}
            />
            <p className={s.notaAnonima}>
              Não se preocupe, suas respostas serão anônimas
            </p>
          </div>
        ) : null}

        {temObrigatorias(pesquisa) ? (
          <p className={s.notaObrigatoria}>*Indica uma pergunta obrigatória</p>
        ) : null}
      </section>

      <div className={s.acaoCentral}>
        <Botao variante="marca">Começar pesquisa</Botao>
      </div>
    </VistaResposta>
  )
}
