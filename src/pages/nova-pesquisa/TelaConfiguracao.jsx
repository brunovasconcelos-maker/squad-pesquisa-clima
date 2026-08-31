import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Configuracao.module.css'
import CabecalhoFluxo from '../../components/fluxo/CabecalhoFluxo.jsx'
import RodapeFluxo from '../../components/fluxo/RodapeFluxo.jsx'
import Botao from '../../components/fluxo/Botao.jsx'
import LinhaResumo from '../../components/fluxo/LinhaResumo.jsx'
import Interruptor from '../../components/fluxo/Interruptor.jsx'
import ModalParticipantes from './ModalParticipantes.jsx'
import { usePesquisa, rotuloParticipantes } from './estado.jsx'
import { ler, gravar, guardar, criarDoFluxo } from '../../lib/pesquisas.js'
import {
  ModalDataEnvio,
  ModalRecorrencia,
  ModalFrequencia,
  ModalPrazo,
  ModalMensagemFinal,
  ModalAvancadas,
} from './ModaisConfiguracao.jsx'

/*
 * Último passo do fluxo (Figma 8067:5498).
 *
 * O Figma rotula a seção como "Configurações" e o link como "Ver settings
 * avançadas"; os textos aqui seguem o combinado: "Configuração" e "Ver
 * configurações avançadas". "Frequencia" também ganhou o acento.
 *
 * Os modais abrem por estado local, não por rota: são passos dentro desta
 * tela, e voltar de um não deveria mexer no histórico do navegador.
 *
 * Data e hora são texto livre — não há date picker ainda —, então o valor
 * mostrado na lista é montado a partir do que foi digitado.
 */
function textoDeEnvio({ imediato, data, hora }) {
  return imediato ? 'Imediatamente' : `${data}, as ${hora}`
}

function textoDePrazo({ tipo, periodo, dias, data, hora }) {
  if (tipo === 'data') return `${data}, as ${hora}`
  if (tipo === 'dias') return dias ? `${dias} dias` : 'Dias'
  return periodo
}

export default function TelaConfiguracao() {
  const navigate = useNavigate()
  const { pesquisa, definir, definirConfiguracao, idDoRascunho, sair } = usePesquisa()
  const [modal, setModal] = useState(null)

  const c = pesquisa.configuracao
  const fechar = () => setModal(null)
  /* Todo modal salva do mesmo jeito: grava o campo e fecha. */
  const salvar = (campo) => (valor) => {
    definirConfiguracao({ [campo]: valor })
    fechar()
  }

  return (
    <div className={s.tela}>
      <CabecalhoFluxo titulo="Nova Pesquisa" onFechar={sair} />

      <div className={s.miolo}>
        <div className={s.coluna}>
          <div className={s.lista}>
            <p className={s.secao}>Configuração</p>

            <LinhaResumo
              rotulo="Participantes"
              valor={rotuloParticipantes(pesquisa.participantes)}
              onAbrir={() => setModal('participantes')}
            />
            <LinhaResumo
              rotulo="Respostas anônimas"
              controle={
                <Interruptor
                  ligado={c.respostasAnonimas}
                  rotulo="Respostas anônimas"
                  onAlternar={() =>
                    definirConfiguracao({
                      respostasAnonimas: !c.respostasAnonimas,
                    })
                  }
                />
              }
            />
            <LinhaResumo
              rotulo="Data de Envio"
              valor={textoDeEnvio(c.envio)}
              onAbrir={() => setModal('envio')}
            />
            <LinhaResumo
              rotulo="Recorrência"
              valor={c.recorrencia}
              onAbrir={() => setModal('recorrencia')}
            />
            {/* Sem recorrência não há frequência que faça sentido. */}
            {c.recorrencia === 'Recorrente' ? (
              <LinhaResumo
                rotulo="Frequência"
                valor={c.frequencia}
                onAbrir={() => setModal('frequencia')}
              />
            ) : null}
            <LinhaResumo
              rotulo="Prazo pra respostas"
              valor={textoDePrazo(c.prazo)}
              onAbrir={() => setModal('prazo')}
            />
            <LinhaResumo
              rotulo="Mensagem final"
              valor={c.mensagemFinal}
              cortar
              onAbrir={() => setModal('mensagem')}
            />
          </div>

          <Botao onClick={() => setModal('avancadas')}>
            Ver configurações avançadas
          </Botao>
        </div>
      </div>

      <RodapeFluxo
        progresso={6 / 6}
        rotuloContinuar="Salvar Pesquisa"
        onVoltar={() => navigate('../revisao')}
        onContinuar={() => {
          // Grava antes de sair: a home lê o localStorage ao montar, então a
          // pesquisa nova já aparece na lista sem recarregar a página.
          // Retomando um rascunho, entra no lugar dele: a linha é a mesma,
          // agora com status de verdade.
          gravar(guardar(ler(), criarDoFluxo(pesquisa), idDoRascunho))
          navigate('/')
        }}
      />

      {modal === 'participantes' ? (
        <ModalParticipantes
          selecao={pesquisa.participantes}
          onSalvar={(participantes) => {
            definir({ participantes })
            fechar()
          }}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'envio' ? (
        <ModalDataEnvio
          valor={c.envio}
          onSalvar={salvar('envio')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'recorrencia' ? (
        <ModalRecorrencia
          valor={c.recorrencia}
          onSalvar={salvar('recorrencia')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'frequencia' ? (
        <ModalFrequencia
          valor={c.frequencia}
          onSalvar={salvar('frequencia')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'prazo' ? (
        <ModalPrazo
          valor={c.prazo}
          onSalvar={salvar('prazo')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'mensagem' ? (
        <ModalMensagemFinal
          valor={c.mensagemFinal}
          onSalvar={salvar('mensagemFinal')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'avancadas' ? (
        <ModalAvancadas
          valor={c.avancadas}
          onSalvar={salvar('avancadas')}
          onFechar={fechar}
        />
      ) : null}
    </div>
  )
}
