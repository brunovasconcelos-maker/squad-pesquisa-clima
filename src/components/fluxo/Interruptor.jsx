import s from './Interruptor.module.css'

export default function Interruptor({
  ligado = false,
  desabilitado = false,
  rotulo,
  onAlternar,
}) {
  return (
    <button
      type="button"
      className={`${s.interruptor} ${ligado ? s.ligado : s.desligado} ${
        desabilitado ? s.desabilitado : ''
      }`}
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={onAlternar}
    >
      <span className={s.botao} />
    </button>
  )
}
