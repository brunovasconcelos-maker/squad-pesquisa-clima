import s from './Botao.module.css'

export default function Botao({
  variante = 'texto',
  desabilitado = false,
  onClick,
  children,
}) {
  const classe = variante === 'marca' ? `${s.botao} ${s.marca}` : s.botao
  return (
    <button
      type="button"
      className={classe}
      disabled={desabilitado}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
