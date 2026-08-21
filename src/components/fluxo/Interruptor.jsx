import s from './Interruptor.module.css'

export default function Interruptor({ ligado = false, rotulo, onAlternar }) {
  return (
    <button
      type="button"
      className={`${s.interruptor} ${ligado ? s.ligado : s.desligado}`}
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={onAlternar}
    >
      <span className={s.botao} />
    </button>
  )
}
