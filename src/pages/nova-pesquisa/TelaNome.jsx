import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Nome.module.css'
import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import ModalParticipantes from './ModalParticipantes.jsx'
import { usePesquisa, rotuloParticipantes, temParticipantes } from './estado.jsx'

import caretRight from '../../assets/icons/CaretRight.svg'

/*
 * Telas 1 e 3 do Figma (8057:3447 e 8067:5268) são a mesma tela: a 3 é só a 1
 * com valores preenchidos. Com o estado ligado, uma cobre a outra.
 *
 * O modal da tela 2 abre por estado local, não por rota: ele é um passo
 * dentro desta tela, e voltar dele não deveria mexer no histórico.
 */
export default function TelaNome() {
  const navigate = useNavigate()
  const { pesquisa, definir, sair } = usePesquisa()
  const [modalAberto, setModalAberto] = useState(false)

  const podeContinuar =
    pesquisa.nome.trim() !== '' && temParticipantes(pesquisa.participantes)

  return (
    <>
      <FluxoLayout
        titulo="Nova Pesquisa"
        progresso={1 / 6}
        continuarDesabilitado={!podeContinuar}
        onFechar={sair}
        /* Sair pelo Voltar é sair do mesmo jeito: os dois passam pela mesma
           pergunta, senão um deles descarta tudo em silêncio. */
        onVoltar={sair}
        onContinuar={() => navigate('template')}
      >
        <div className={s.conteudo}>
          <input
            className={s.campoGrande}
            type="text"
            placeholder="Nome da Pesquisa"
            value={pesquisa.nome}
            onChange={(e) => definir({ nome: e.target.value })}
            aria-label="Nome da Pesquisa"
          />

          <div className={s.bloco}>
            <p className={s.rotulo}>Para quem é esse Pesquisa?</p>
            <div className={s.linha}>
              <button
                type="button"
                className={s.linhaTexto}
                onClick={() => setModalAberto(true)}
              >
                <span className={s.linhaChave}>Participantes</span>
                <span className={s.linhaValor}>
                  {rotuloParticipantes(pesquisa.participantes)}
                </span>
              </button>
              <IconeBotao
                src={caretRight}
                rotulo="Escolher participantes"
                onClick={() => setModalAberto(true)}
              />
            </div>
          </div>
        </div>
      </FluxoLayout>

      {modalAberto ? (
        <ModalParticipantes
          selecao={pesquisa.participantes}
          onSalvar={(selecao) => {
            definir({ participantes: selecao })
            setModalAberto(false)
          }}
          onFechar={() => setModalAberto(false)}
        />
      ) : null}
    </>
  )
}
