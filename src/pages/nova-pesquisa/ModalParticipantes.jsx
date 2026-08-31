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
 * "Toda empresa" e os grupos se excluem: marcar um grupo desmarca a empresa
 * inteira, e marcar a empresa limpa os grupos. São duas formas de dizer a
 * mesma coisa — quem é o público —, e as duas ligadas ao mesmo tempo não
 * querem dizer nada além do que "Toda empresa" já diz.
 *
 * A lista de grupos começa fechada: quem escolhe a empresa inteira não
 * precisa ver os grupos, e quem quer um grupo abre.
 *
 * A busca continua decorativa, como combinado.
 */
export default function ModalParticipantes({ selecao, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(selecao)
  /* Aberta quando já há grupo escolhido: fechar a lista escondendo uma
     escolha que existe seria pior do que abri-la sem precisar. */
  const [gruposAbertos, setGruposAbertos] = useState(
    () => (selecao?.grupos?.length ?? 0) > 0,
  )

  const alternarEmpresa = () =>
    setRascunho((r) =>
      r.todaEmpresa
        ? { ...r, todaEmpresa: false }
        : { ...r, todaEmpresa: true, grupos: [] },
    )

  const alternarGrupo = (grupo) =>
    setRascunho((r) => ({
      ...r,
      // Escolher um grupo é dizer que não é a empresa inteira.
      todaEmpresa: false,
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

          <button
            type="button"
            className={s.linhaGrupos}
            aria-expanded={gruposAbertos}
            onClick={() => setGruposAbertos((aberta) => !aberta)}
          >
            <span className={s.rotuloGrupos}>Grupos:</span>
            <img
              className={`${s.caixa} ${gruposAbertos ? s.setaAberta : ''}`}
              src={caretDown}
              alt=""
              width={24}
              height={24}
            />
          </button>

          {gruposAbertos ? (
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
          ) : null}
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
