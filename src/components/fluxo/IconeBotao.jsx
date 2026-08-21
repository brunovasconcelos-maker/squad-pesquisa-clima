import s from './IconeBotao.module.css'

export default function IconeBotao({ src, rotulo }) {
  return (
    <button type="button" className={s.iconeBotao} aria-label={rotulo}>
      <img className={s.icone} src={src} alt="" width={24} height={24} />
    </button>
  )
}
