import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Carregando.module.css'
import { usePesquisa } from './estado.jsx'

import pipoLoading from '../../assets/images/Pipo-Loading.png'

const ESPERA_MS = 3000

/*
 * Tela de carregamento do caminho com template. Sem Figma ainda; vira vídeo
 * mais para a frente.
 *
 * O palco existe para a troca por vídeo mais para a frente: é só substituir
 * o <img> por um <video> aqui dentro, sem mexer no resto.
 *
 * As perguntas são montadas no fim da espera, junto com a navegação: fazer
 * antes deixaria estado escrito à toa se a pessoa fechasse a tela no meio.
 */
export default function TelaCarregando() {
  const navigate = useNavigate()
  const { gerar } = usePesquisa()

  useEffect(() => {
    const id = setTimeout(() => {
      gerar()
      navigate('../revisao', { replace: true })
    }, ESPERA_MS)
    return () => clearTimeout(id)
    // Só na montagem: recriar o timer a cada render reiniciaria a contagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={s.tela}>
      <div className={s.palco}>
        <img
          className={s.ilustracao}
          src={pipoLoading}
          alt=""
          width={670}
          height={374}
        />
      </div>
    </div>
  )
}
