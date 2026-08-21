import s from './Perguntas.module.css'
import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'

import minus from '../../assets/icons/Minus.svg'
import plus from '../../assets/icons/Plus.svg'

/*
 * Tela 5 (Figma 8063:4769). O número é estático: o stepper ainda não conta.
 *
 * O "Pular" foi pedido para esta tela. O nó do Figma mostra só Voltar e
 * Continuar no rodapé — o botão entra por instrução, não por medida.
 */
export default function TelaPerguntas() {
  return (
    <FluxoLayout
      titulo="Feedback time de Design"
      progresso={5 / 6}
      centrada
      mostrarPular
    >
      <div className={s.conteudo}>
        <p className={s.rotulo}>Quantas perguntas serão feitas?</p>

        <div className={s.contador}>
          <button type="button" className={s.passo} aria-label="Menos uma pergunta">
            <img className={s.icone} src={minus} alt="" width={24} height={24} />
          </button>
          <p className={s.numero}>10</p>
          <button type="button" className={s.passo} aria-label="Mais uma pergunta">
            <img className={s.icone} src={plus} alt="" width={24} height={24} />
          </button>
        </div>

        <div className={s.estimativa}>
          <p className={s.estimativaTexto}>Em média</p>
          <p className={s.estimativaValor}>12 minutos</p>
          <p className={s.estimativaTexto}>para responder</p>
        </div>
      </div>
    </FluxoLayout>
  )
}
