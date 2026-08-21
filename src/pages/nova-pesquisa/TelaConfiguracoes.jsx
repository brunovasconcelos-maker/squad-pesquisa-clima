import { useNavigate } from 'react-router-dom'
import s from './TelaConfiguracoes.module.css'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'

import close from '../../assets/icons/Close.svg'

/* Último passo do fluxo, ainda por construir. Só o X, como os outros stubs. */
export default function TelaConfiguracoes() {
  const navigate = useNavigate()
  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <IconeBotao src={close} rotulo="Fechar" onClick={() => navigate('/')} />
      </header>
    </div>
  )
}
