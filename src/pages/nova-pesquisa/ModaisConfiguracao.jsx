import { useState } from 'react'
import s from './Configuracao.module.css'
import ModalFluxo from '../../components/fluxo/ModalFluxo.jsx'
import LinhaResumo from '../../components/fluxo/LinhaResumo.jsx'
import Interruptor from '../../components/fluxo/Interruptor.jsx'

import circle from '../../assets/icons/Circle.svg'
import radioButton from '../../assets/icons/RadioButton.svg'
import square from '../../assets/icons/Square.svg'
import checkSquare from '../../assets/icons/CheckSquare.svg'

/*
 * Os modais da tela de Configuração.
 *
 * Todos seguem a mesma regra: editam uma cópia e só o "Salvar" devolve o
 * valor. "Voltar" e o X descartam — é o que faz o rascunho não vazar para a
 * lista da tela.
 *
 * São duas artes de rádio, como no Figma: Circle para a opção solta e
 * RadioButton para a marcada.
 */

function Opcao({ texto, marcada = false, rotulo, onEscolher }) {
  return (
    <button
      type="button"
      className={s.opcao}
      role="radio"
      aria-checked={marcada}
      aria-label={rotulo}
      onClick={onEscolher}
    >
      <img
        className={s.icone}
        src={marcada ? radioButton : circle}
        alt=""
        width={24}
        height={24}
      />
      {texto ? <span className={s.textoOpcao}>{texto}</span> : null}
    </button>
  )
}

function ListaDeOpcoes({ opcoes, marcada, onEscolher }) {
  return (
    <div className={s.opcoes} role="radiogroup">
      {opcoes.map((texto) => (
        <Opcao
          key={texto}
          texto={texto}
          marcada={texto === marcada}
          onEscolher={() => onEscolher(texto)}
        />
      ))}
    </div>
  )
}

function ParDeCampos({ data, hora, onMudar, desabilitado = false }) {
  return (
    <div className={s.parDeCampos}>
      <input
        className={s.campoData}
        type="text"
        value={data}
        disabled={desabilitado}
        aria-label="Data"
        onChange={(e) => onMudar({ data: e.target.value })}
      />
      <input
        className={s.campoData}
        type="text"
        value={hora}
        disabled={desabilitado}
        aria-label="Hora"
        onChange={(e) => onMudar({ hora: e.target.value })}
      />
    </div>
  )
}

/* Fecha e devolve, ou fecha e descarta — o par que todo modal daqui usa. */
function useRascunho(valor, onSalvar) {
  const [rascunho, setRascunho] = useState(valor)
  const alterar = (campos) => setRascunho((r) => ({ ...r, ...campos }))
  return [rascunho, setRascunho, alterar, () => onSalvar(rascunho)]
}

export function ModalDataEnvio({ valor, onSalvar, onFechar }) {
  const [rascunho, , alterar, salvar] = useRascunho(valor, onSalvar)

  return (
    <ModalFluxo
      titulo="Data e Hora de Envio"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={salvar}
    >
      <div className={s.blocoEnvio}>
        {/* Marcar "enviar imediatamente" desliga os campos: a data deixa de
            valer, e deixá-los editáveis sugeriria o contrário. */}
        <ParDeCampos
          data={rascunho.data}
          hora={rascunho.hora}
          desabilitado={rascunho.imediato}
          onMudar={alterar}
        />
        <button
          type="button"
          className={s.linhaCheck}
          role="checkbox"
          aria-checked={rascunho.imediato}
          onClick={() => alterar({ imediato: !rascunho.imediato })}
        >
          <img
            className={s.icone}
            src={rascunho.imediato ? checkSquare : square}
            alt=""
            width={24}
            height={24}
          />
          <span className={s.textoCheck}>Enviar imediatamente</span>
        </button>
      </div>
    </ModalFluxo>
  )
}

export function ModalRecorrencia({ valor, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(valor)
  return (
    <ModalFluxo
      titulo="Recorrência"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={() => onSalvar(rascunho)}
    >
      <ListaDeOpcoes
        opcoes={['Recorrente', 'Única']}
        marcada={rascunho}
        onEscolher={setRascunho}
      />
    </ModalFluxo>
  )
}

export function ModalFrequencia({ valor, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(valor)
  return (
    <ModalFluxo
      titulo="Frequência"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={() => onSalvar(rascunho)}
    >
      <ListaDeOpcoes
        opcoes={[
          'Semanal',
          'Mensal',
          'A cada três meses',
          'A cada seis meses',
          'Anual',
        ]}
        marcada={rascunho}
        onEscolher={setRascunho}
      />
    </ModalFluxo>
  )
}

const PERIODOS = ['1 dia', '1 semana', '1 mês']

export function ModalPrazo({ valor, onSalvar, onFechar }) {
  const [rascunho, , alterar, salvar] = useRascunho(valor, onSalvar)
  const porData = rascunho.tipo === 'data'

  return (
    <ModalFluxo
      titulo="Prazo pra respostas"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={salvar}
    >
      <div className={s.opcoes} role="radiogroup">
        {PERIODOS.map((periodo) => (
          <Opcao
            key={periodo}
            texto={periodo}
            marcada={!porData && rascunho.periodo === periodo}
            onEscolher={() => alterar({ tipo: 'periodo', periodo })}
          />
        ))}

        <div className={s.divisor}>
          <span className={s.divisorLinha} />
          <p className={s.divisorTexto}>ou</p>
          <span className={s.divisorLinha} />
        </div>

        {/* Os campos só ficam editáveis com a opção de data escolhida. */}
        <div className={s.opcaoComCampos}>
          <Opcao
            rotulo="Data específica"
            marcada={porData}
            onEscolher={() => alterar({ tipo: 'data' })}
          />
          <ParDeCampos
            data={rascunho.data}
            hora={rascunho.hora}
            desabilitado={!porData}
            onMudar={alterar}
          />
        </div>
      </div>
    </ModalFluxo>
  )
}

export function ModalMensagemFinal({ valor, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(valor)
  return (
    <ModalFluxo
      titulo="Mensagem final"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={() => onSalvar(rascunho)}
    >
      <textarea
        className={s.mensagem}
        value={rascunho}
        aria-label="Mensagem final"
        onChange={(e) => setRascunho(e.target.value)}
      />
    </ModalFluxo>
  )
}

/* Sem spec própria: três opções que cobrem os casos usuais de lembrete. */
const LEMBRETES = ['Diário', 'Semanal', 'Nunca']

function ModalLembrete({ valor, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(valor)
  return (
    <ModalFluxo
      titulo="Enviar lembrete"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={() => onSalvar(rascunho)}
    >
      <ListaDeOpcoes
        opcoes={LEMBRETES}
        marcada={rascunho}
        onEscolher={setRascunho}
      />
    </ModalFluxo>
  )
}

export function ModalAvancadas({ valor, onSalvar, onFechar }) {
  const [rascunho, , alterar, salvar] = useRascunho(valor, onSalvar)
  const [lembreteAberto, setLembreteAberto] = useState(false)

  return (
    <>
      <ModalFluxo
        titulo="Configurações avançadas"
        espacamento={32}
        onVoltar={onFechar}
        onFechar={onFechar}
        onSalvar={salvar}
      >
        <div className={s.listaAvancada}>
          <LinhaResumo
            rotulo="Enviar lembrete"
            valor={rascunho.lembrete}
            onAbrir={() => setLembreteAberto(true)}
          />
          <LinhaResumo
            rotulo="Mostrar barra de progresso"
            controle={
              <Interruptor
                ligado={rascunho.barraProgresso}
                rotulo="Mostrar barra de progresso"
                onAlternar={() =>
                  alterar({ barraProgresso: !rascunho.barraProgresso })
                }
              />
            }
          />
          <LinhaResumo
            rotulo="Embaralhar perguntas"
            controle={
              <Interruptor
                ligado={rascunho.embaralhar}
                rotulo="Embaralhar perguntas"
                onAlternar={() => alterar({ embaralhar: !rascunho.embaralhar })}
              />
            }
          />
          <LinhaResumo
            rotulo="Tornar as perguntas obrigatórias por padrão"
            controle={
              <Interruptor
                ligado={rascunho.obrigatorias}
                rotulo="Tornar as perguntas obrigatórias por padrão"
                onAlternar={() =>
                  alterar({ obrigatorias: !rascunho.obrigatorias })
                }
              />
            }
          />
        </div>
      </ModalFluxo>

      {/* O seletor de lembrete abre por cima e devolve para o rascunho daqui,
          então sair dele não perde o que já foi mexido nos interruptores. */}
      {lembreteAberto ? (
        <ModalLembrete
          valor={rascunho.lembrete}
          onSalvar={(lembrete) => {
            alterar({ lembrete })
            setLembreteAberto(false)
          }}
          onFechar={() => setLembreteAberto(false)}
        />
      ) : null}
    </>
  )
}
