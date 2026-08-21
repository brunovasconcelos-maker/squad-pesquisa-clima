import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Carregando.module.css'
import { usePesquisa } from './estado.jsx'

const ESPERA_MS = 3000

/*
 * Tela de carregamento do caminho com template. Sem Figma ainda; vira vídeo
 * mais para a frente.
 *
 * FALTA O ASSET: a ilustração do Pipo na mesa não está em src/assets/images.
 * O palco fica vazio de propósito — desenhar uma caixa ou um spinner no lugar
 * seria inventar um placeholder. Quando o arquivo chegar é um <img> aqui
 * dentro; quando virar vídeo, um <video> no mesmo lugar.
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
      <div className={s.palco} />
    </div>
  )
}
