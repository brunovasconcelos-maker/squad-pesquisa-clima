import { useState } from 'react'
import s from './Participantes.module.css'
import Botao from '../../components/fluxo/Botao.jsx'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import { GRUPOS } from './estado.jsx'

import checkSquare from '../../assets/icons/CheckSquare.svg'
import square from '../../assets/icons/Square.svg'
import caretDown from '../../assets/icons/CaretDown.svg'
import search from '../../assets/icons/Search.svg'
import close from '../../assets/icons/Close.svg'

/*
 * Tela 2 (Figma 8057:3674): modal de participantes.
 *
 * A seleção é editada numa cópia local e só sobe no "Salvar" — é o que faz o
 * "Voltar" descartar as marcações sem precisar desfazer nada.
 *
 * A busca continua decorativa, como combinado.
 */
export default function ModalParticipantes({ selecao, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(selecao)

  const alternarEmpresa = () =>
    setRascunho((r) => ({ ...r, todaEmpresa: !r.todaEmpresa }))

  const alternarGrupo = (grupo) =>
    setRascunho((r) => ({
      ...r,
      grupos: r.grupos.includes(grupo)
        ? r.grupos.filter((g) => g !== grupo)
        : [...r.grupos, grupo],
    }))

  const Item = ({ nome, marcado, onAlternar }) => (
    <button type="button" className={s.item} onClick={onAlternar}>
      <img
        className={s.caixa}
        src={marcado ? checkSquare : square}
        alt=""
        width={24}
        height={24}
      />
      <span className={s.itemNome}>{nome}</span>
      <span className={s.itemContagem}>56 membros</span>
    </button>
  )

  return (
    <div className={s.scrim}>
      <div className={s.modal} role="dialog" aria-label="Participantes">
        <div className={s.cabecalho}>
          <p className={s.titulo}>Participantes</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={onFechar} />
        </div>

        <div className={s.grupos}>
          <Item
            nome="Toda empresa"
            marcado={rascunho.todaEmpresa}
            onAlternar={alternarEmpresa}
          />

          <div className={s.linhaGrupos}>
            <p className={s.rotuloGrupos}>Grupos:</p>
            <img
              className={s.caixa}
              src={caretDown}
              alt=""
              width={24}
              height={24}
            />
          </div>

          <div className={s.sublista}>
            {GRUPOS.map((grupo) => (
              <Item
                key={grupo}
                nome={grupo}
                marcado={rascunho.grupos.includes(grupo)}
                onAlternar={() => alternarGrupo(grupo)}
              />
            ))}
          </div>
        </div>

        <div className={s.divisor}>
          <span className={s.divisorLinha} />
          <p className={s.divisorTexto}>ou</p>
          <span className={s.divisorLinha} />
        </div>

        <div className={s.busca}>
          <img
            className={s.buscaIcone}
            src={search}
            alt=""
            width={24}
            height={24}
          />
          <input
            className={s.buscaCampo}
            type="text"
            placeholder="Pesquisar um membro ou grupo"
            aria-label="Pesquisar um membro ou grupo"
          />
        </div>

        <div className={s.rodape}>
          <Botao onClick={onFechar}>Voltar</Botao>
          <Botao variante="marca" onClick={() => onSalvar(rascunho)}>
            Salvar
          </Botao>
        </div>
      </div>
    </div>
  )
}
