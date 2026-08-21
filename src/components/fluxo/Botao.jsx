import s from './Botao.module.css'

export default function Botao({ variante = 'texto', children }) {
  const classe = variante === 'marca' ? `${s.botao} ${s.marca}` : s.botao
  return (
    <button type="button" className={classe}>
      {children}
    </button>
  )
}
