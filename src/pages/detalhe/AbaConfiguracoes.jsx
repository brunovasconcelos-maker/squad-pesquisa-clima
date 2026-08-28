import { useState } from 'react'
import s from './AbaConfiguracoes.module.css'
import Botao from '../../components/fluxo/Botao.jsx'
import Interruptor from '../../components/fluxo/Interruptor.jsx'
import LinhaResumo from '../../components/fluxo/LinhaResumo.jsx'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import ModalFluxo from '../../components/fluxo/ModalFluxo.jsx'
import ModalParticipantes from '../nova-pesquisa/ModalParticipantes.jsx'
import {
  ModalDataEnvio,
  ModalFrequencia,
  ModalLembrete,
  ModalPrazo,
} from '../nova-pesquisa/ModaisConfiguracao.jsx'
import { rotuloParticipantes } from '../nova-pesquisa/estado.jsx'
import { formatarComDia, paraData } from '../../lib/datas.js'

import caretRight from '../../assets/icons/CaretRight.svg'

/*
 * Aba "Configurações" do detalhe (Figma 8072:6532) — só o visual.
 *
 * Os valores são o exemplo do Figma, guardados em estado local: nada aqui
 * lê nem grava a pesquisa ainda. Os interruptores também são estáticos de
 * propósito — ligar/desligar mexe no status da pesquisa e vem depois.
 *
 * O que já funciona é abrir os modais, e eles são os mesmos do fluxo de
 * criação: "Participantes", "Data e Hora de Envio", "Frequência", "Prazo
 * pra respostas" e "Enviar lembrete". Salvar num deles atualiza só a linha
 * na tela, para o modal não parecer quebrado; a gravação é do próximo passo.
 *
 * O Figma escreve "Apresentaçao" sem o til — aqui vai "Apresentação".
 */

/* A linha "Repetir" mostra a frequência com a frase do Figma, mas o valor
   guardado continua sendo o vocabulário do modal de Frequência: são as duas
   pontas da mesma escolha, e traduzir só na exibição evita duas listas. */
const REPETICAO = {
  Semanal: 'Toda semana',
  Mensal: 'Todo mês',
  'A cada três meses': 'A cada três meses',
  'A cada seis meses': 'A cada seis meses',
  Anual: 'Todo ano',
}

/* O mesmo gradiente da faixa da Revisão (Figma 8065:4916). O seletor de cor
   devolve um hex sólido, então a capa é uma string de background: cabe o
   gradiente de fábrica e a cor escolhida. */
const CAPA_PADRAO = 'linear-gradient(96.57deg, #d2cffb 10.98%, #5c52ed 90.35%)'
const COR_PADRAO = '#5c52ed'

const EXEMPLO = {
  participantes: { todaEmpresa: true, grupos: [] },
  envio: { imediato: false, data: '14 Agosto 2026', hora: '09:00' },
  frequencia: 'Mensal',
  prazo: { tipo: 'periodo', periodo: '1 semana', data: '', hora: '' },
  lembrete: 'Diário',
  capa: { fundo: CAPA_PADRAO, cor: COR_PADRAO },
}

/* Um cartão da coluna: título, as linhas e o que vier de rodapé (a pílula
   do primeiro cartão). O `items-center` do Figma é o que centra a pílula, e
   é por isso que o título precisa esticar sozinho. */
function Cartao({ titulo, rodape, children }) {
  return (
    <section className={s.cartao}>
      <p className={s.secao}>{titulo}</p>
      <div className={s.linhas}>{children}</div>
      {rodape}
    </section>
  )
}

/* Interruptor estático: a linha inteira existe, só a troca de estado é que
   não. Sem `onAlternar` ele não muda nada ao ser clicado. */
function LinhaInterruptor({ rotulo, ligado }) {
  return (
    <LinhaResumo
      rotulo={rotulo}
      controle={<Interruptor ligado={ligado} rotulo={rotulo} />}
    />
  )
}

/* Seletor livre de cor para a capa. Sem spec própria no Figma: a casca é a
   dos outros modais e o miolo é o input de cor do navegador, com a amostra
   grande ao lado para ver a escolha antes de salvar. */
function ModalCapa({ valor, onSalvar, onFechar }) {
  const [cor, setCor] = useState(valor.cor)
  return (
    <ModalFluxo
      titulo="Capa"
      onVoltar={onFechar}
      onFechar={onFechar}
      onSalvar={() => onSalvar({ fundo: cor, cor })}
    >
      <div className={s.blocoCapa}>
        <span className={s.amostraGrande} style={{ background: cor }} />
        <input
          className={s.seletorDeCor}
          type="color"
          value={cor}
          aria-label="Cor da capa"
          onChange={(e) => setCor(e.target.value)}
        />
      </div>
    </ModalFluxo>
  )
}

export default function AbaConfiguracoes() {
  const [valores, setValores] = useState(EXEMPLO)
  const [modal, setModal] = useState(null)

  const fechar = () => setModal(null)
  /* Todo modal termina igual: guarda o campo no exemplo e fecha. */
  const salvar = (campo) => (valor) => {
    setValores((v) => ({ ...v, [campo]: valor }))
    fechar()
  }

  const envio = valores.envio
  const textoDoEnvio = envio.imediato
    ? 'Imediatamente'
    : formatarComDia(paraData(envio.data, envio.hora)?.toISOString())

  const prazo = valores.prazo
  const textoDoPrazo =
    prazo.tipo === 'data' ? `${prazo.data}, as ${prazo.hora}` : prazo.periodo

  return (
    <div className={s.coluna}>
      <Cartao
        titulo="Opções publicadas"
        rodape={
          <Botao variante="contorno">
            Copiar link da pesquisa
            {/* Falta o ícone Link.svg em src/assets/icons. O vão de 24px
                fica reservado para o arquivo entrar sem mexer na pílula. */}
            <span className={s.vaoDeIcone} aria-hidden="true" />
          </Botao>
        }
      >
        <LinhaInterruptor rotulo="Publicar formulário" ligado />
        <LinhaInterruptor rotulo="Aceitando respostas" ligado />
        <LinhaInterruptor rotulo="Respostas anônimas" ligado />
        <LinhaResumo
          rotulo="Participantes"
          valor={rotuloParticipantes(valores.participantes)}
          onAbrir={() => setModal('participantes')}
        />
      </Cartao>

      <Cartao titulo="Datas">
        <LinhaResumo
          rotulo="Próximo envio"
          valor={textoDoEnvio}
          onAbrir={() => setModal('envio')}
        />
        <LinhaResumo
          rotulo="Repetir"
          valor={REPETICAO[valores.frequencia] ?? valores.frequencia}
          onAbrir={() => setModal('frequencia')}
        />
        <LinhaResumo
          rotulo="Aceitar resposta"
          valor={textoDoPrazo}
          onAbrir={() => setModal('prazo')}
        />
        <LinhaResumo
          rotulo="Enviar lembrete"
          valor={valores.lembrete}
          onAbrir={() => setModal('lembrete')}
        />
      </Cartao>

      <Cartao titulo="Apresentação">
        {/* A capa não cabe em `valor`: no lugar do texto vai a amostra, e a
            seta continua sendo a do LinhaResumo. */}
        <LinhaResumo
          rotulo="Capa"
          controle={
            <div className={s.controleDaCapa}>
              <span
                className={s.amostra}
                style={{ background: valores.capa.fundo }}
              />
              <IconeBotao
                src={caretRight}
                rotulo="Abrir Capa"
                onClick={() => setModal('capa')}
              />
            </div>
          }
        />
        <LinhaInterruptor rotulo="Mostrar barra de progresso" ligado />
        <LinhaInterruptor rotulo="Embaralhar perguntas" ligado={false} />
        <LinhaInterruptor rotulo="Tornar as perguntas obrigatórias por padrão" ligado />
      </Cartao>

      {modal === 'participantes' ? (
        <ModalParticipantes
          selecao={valores.participantes}
          onSalvar={salvar('participantes')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'envio' ? (
        <ModalDataEnvio
          valor={valores.envio}
          onSalvar={salvar('envio')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'frequencia' ? (
        <ModalFrequencia
          valor={valores.frequencia}
          onSalvar={salvar('frequencia')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'prazo' ? (
        <ModalPrazo
          valor={valores.prazo}
          onSalvar={salvar('prazo')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'lembrete' ? (
        <ModalLembrete
          valor={valores.lembrete}
          onSalvar={salvar('lembrete')}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'capa' ? (
        <ModalCapa
          valor={valores.capa}
          onSalvar={salvar('capa')}
          onFechar={fechar}
        />
      ) : null}
    </div>
  )
}
