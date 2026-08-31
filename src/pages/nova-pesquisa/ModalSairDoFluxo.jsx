import s from './Editor.module.css'
import Botao from '../../components/fluxo/Botao.jsx'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'

import close from '../../assets/icons/Close.svg'

/*
 * Confirmação ao fechar o fluxo antes de salvar.
 *
 * Mesma casca dos outros modais de confirmação do projeto, com um par de
 * ações em vez de "Cancelar / Confirmar": o X aqui não é uma pergunta de sim
 * ou não, é uma escolha entre jogar fora e guardar para depois. Fechar o
 * modal pelo X dele volta para o fluxo sem decidir nada.
 */
export default function ModalSairDoFluxo({ onDescartar, onSalvar, onCancelar }) {
  return (
    <div className={s.scrim}>
      <div
        className={`${s.modal} ${s.modalCompacto}`}
        role="dialog"
        aria-label="Sair da criação?"
      >
        <div className={s.cabecalho}>
          <p className={s.titulo}>Sair da criação?</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={onCancelar} />
        </div>

        <p className={s.texto}>
          A pesquisa ainda não foi salva. Você pode guardar o que já preencheu
          como rascunho e continuar depois, ou descartar tudo.
        </p>

        <div className={s.rodape}>
          <Botao onClick={onDescartar}>Descartar</Botao>
          <Botao variante="marca" onClick={onSalvar}>
            Salvar como Rascunho
          </Botao>
        </div>
      </div>
    </div>
  )
}
