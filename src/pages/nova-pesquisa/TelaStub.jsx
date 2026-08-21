import { useNavigate } from 'react-router-dom'
import s from './TelaStub.module.css'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'

import close from '../../assets/icons/Close.svg'

/*
 * Provisório. Segura dois destinos que ainda não têm tela: o caminho da
 * pesquisa em branco e o carregamento depois do prompt. Só o X.
 */
export default function TelaStub() {
  const navigate = useNavigate()
  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <IconeBotao src={close} rotulo="Fechar" onClick={() => navigate('/')} />
      </header>
    </div>
  )
}
