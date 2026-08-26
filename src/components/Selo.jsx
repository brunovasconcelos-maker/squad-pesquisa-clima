import s from './Selo.module.css'

/* Pílula de status. Nasceu na linha da lista e agora o cartão do detalhe usa
   a mesma, então mora aqui em vez de num dos dois. */
const TONS = {
  positivo: s.positivo,
  destaque: s.destaque,
  acao: s.acao,
  negativo: s.negativo,
  padrao: s.padrao,
}

export default function Selo({ status }) {
  return <span className={`${s.selo} ${TONS[status.tom]}`}>{status.texto}</span>
}
