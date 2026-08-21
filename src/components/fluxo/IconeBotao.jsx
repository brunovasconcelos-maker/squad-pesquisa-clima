import s from './IconeBotao.module.css'

export default function IconeBotao({ src, rotulo, onClick }) {
  return (
    <button
      type="button"
      className={s.iconeBotao}
      aria-label={rotulo}
      onClick={onClick}
    >
      <img className={s.icone} src={src} alt="" width={24} height={24} />
    </button>
  )
}
