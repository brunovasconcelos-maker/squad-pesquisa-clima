import { useNavigate } from 'react-router-dom'
import s from './TelaConfirmacao.module.css'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'

import close from '../../assets/icons/Close.svg'

/*
 * Fim do fluxo, ainda por construir: aqui entra a confirmação de que a
 * pesquisa foi salva. Por enquanto só o X.
 */
export default function TelaConfirmacao() {
  const navigate = useNavigate()
  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <IconeBotao src={close} rotulo="Fechar" onClick={() => navigate('/')} />
      </header>
    </div>
  )
}
