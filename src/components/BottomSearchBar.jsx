import { useRef, useState } from 'react'
import { MagnifyingGlass, X, Microphone, PaperPlaneRight } from '@phosphor-icons/react'
import s from './BottomSearchBar.module.css'

import pipoAvatar from '../assets/images/PipoAvatar.png'

const PLACEHOLDER_BUSCA = 'Buscar uma pesquisa...'
const PLACEHOLDER_PIPO = 'Pergunte ao Pipo...'

/*
 * Barra de busca flutuante — porte do mesmo componente do Gestão de Pessoas
 * (src/components/BottomSearchBar.jsx de lá), com os mesmos três estados:
 *
 *  - padrão: lupa + "Buscar uma pesquisa..." + pílula "Pergunte ao Pipo"
 *  - busca: foco no campo, filtra a lista pelo nome enquanto digita, X fecha
 *  - Pipo: fundo amarelo, avatar do Pipo no lugar da lupa, microfone vira
 *    avião de papel assim que há texto — reservado para uma pergunta ao
 *    Pipo mais para a frente, então digitar aqui não filtra nada ainda.
 *
 * Só a pílula muda de estado: ela é o único jeito de entrar no modo Pipo, e
 * só aparece no padrão — por isso não dá para ir de "busca" direto para
 * "Pipo" sem passar por um campo vazio primeiro.
 */
export default function BottomSearchBar({ onBuscar }) {
  const [modo, setModo] = useState('padrao')
  const [valor, setValor] = useState('')
  const campoRef = useRef(null)

  const alterar = (e) => {
    const novoValor = e.target.value
    setValor(novoValor)
    if (modo === 'busca') onBuscar(novoValor)
  }

  const focar = () => setModo((atual) => (atual === 'padrao' ? 'busca' : atual))

  const ativarPipo = () => {
    setModo('pipo')
    campoRef.current?.focus()
  }

  const limparBusca = () => {
    setValor('')
    setModo('padrao')
    onBuscar('')
    campoRef.current?.blur()
  }

  const limparPipo = () => {
    setValor('')
    setModo('padrao')
    campoRef.current?.blur()
  }

  return (
    <div className={`${s.barra} ${modo === 'pipo' ? s.barraPipo : ''}`}>
      <div className={s.molduraIcone}>
        {modo === 'pipo' ? (
          <img className={s.avatarPipo} src={pipoAvatar} alt="" />
        ) : (
          <MagnifyingGlass size={20} color="#798282" />
        )}
      </div>

      <input
        ref={campoRef}
        type="text"
        className={s.campo}
        placeholder={modo === 'pipo' ? PLACEHOLDER_PIPO : PLACEHOLDER_BUSCA}
        value={valor}
        onChange={alterar}
        onFocus={focar}
        aria-label={modo === 'pipo' ? PLACEHOLDER_PIPO : PLACEHOLDER_BUSCA}
      />

      {modo === 'padrao' ? (
        <button type="button" className={s.pilulaPipo} onClick={ativarPipo}>
          Pergunte ao Pipo
        </button>
      ) : null}

      {modo === 'busca' ? (
        <button
          type="button"
          className={s.fechar}
          aria-label="Fechar busca"
          onClick={limparBusca}
        >
          <X size={20} color="#000000" />
        </button>
      ) : null}

      {modo === 'pipo' ? (
        <>
          <button
            type="button"
            className={`${s.acaoPipo} ${s.acaoPipoTransparente}`}
            aria-label={valor ? 'Enviar' : 'Gravar áudio'}
          >
            {valor ? (
              <PaperPlaneRight size={20} color="#5d4309" />
            ) : (
              <Microphone size={20} color="#5d4309" />
            )}
          </button>
          <button
            type="button"
            className={s.acaoPipo}
            aria-label="Fechar Pipo"
            onClick={limparPipo}
          >
            <X size={20} color="#5d4309" />
          </button>
        </>
      ) : null}
    </div>
  )
}
