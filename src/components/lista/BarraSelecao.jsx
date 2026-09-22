import { CopySimple } from '@phosphor-icons/react'
import s from './BarraSelecao.module.css'
import Botao from '../fluxo/Botao.jsx'

import trashIcon from '../../assets/icons/Trash.svg'
import closeIcon from '../../assets/icons/Close.svg'

/*
 * Barra de ações em massa (Figma, porte do BulkActionBar do Gestão de
 * Pessoas) — mesma casca: pílula branca flutuante, o botão contornado como
 * ação principal e dois ícones soltos. Ocupa o mesmo lugar da busca
 * flutuante de baixo enquanto há linha marcada; quem decide isso é a Home.
 */
export default function BarraSelecao({ quantidade, onDuplicar, onDeletar, onFechar }) {
  return (
    <div className={s.barra}>
      <span className={s.contagem}>{quantidade} selecionados</span>

      <div className={s.acoes}>
        <Botao variante="contorno" onClick={onDuplicar}>
          Duplicar
          <CopySimple size={24} />
        </Botao>

        <button
          type="button"
          className={s.botaoIcone}
          aria-label="Deletar selecionados"
          onClick={onDeletar}
        >
          <img src={trashIcon} width={24} height={24} alt="" />
        </button>

        <button
          type="button"
          className={s.botaoIcone}
          aria-label="Fechar seleção"
          onClick={onFechar}
        >
          <img src={closeIcon} width={24} height={24} alt="" />
        </button>
      </div>
    </div>
  )
}
