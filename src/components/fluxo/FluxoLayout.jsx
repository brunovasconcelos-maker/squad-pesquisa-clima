import s from './FluxoLayout.module.css'
import Botao from './Botao.jsx'
import IconeBotao from './IconeBotao.jsx'

import close from '../../assets/icons/Close.svg'

/*
 * Moldura das seis telas do fluxo "Nova Pesquisa" (Figma 8057:3447 e irmãos).
 * Só o visual: nada navega, nada valida.
 *
 * As telas são full-bleed — no Figma a moldura ocupa os 1440px inteiros e a
 * sidebar não aparece em nenhuma delas. Por isso o fluxo não monta a Sidebar.
 *
 * O miolo é centrado: 1440 menos os 532 (ou 808) da coluna sobra igual dos
 * dois lados, então basta justify-content: center em vez do left absoluto que
 * o Figma exporta.
 *
 * O progresso vem por prop. No Figma as seis telas usam a mesma instância na
 * variante "Step-2" (240 de 1440), ou seja, a barra não foi avançada tela a
 * tela no arquivo — aqui cada tela passa a fração da sua posição no fluxo.
 */
export default function FluxoLayout({
  titulo,
  progresso,
  larga = false,
  centrada = false,
  mostrarContinuar = true,
  mostrarPular = false,
  children,
}) {
  const classesColuna = [
    s.coluna,
    larga ? s.colunaLarga : '',
    centrada ? s.colunaCentrada : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <p className={s.titulo}>{titulo}</p>
        <div className={s.acoesCabecalho}>
          <IconeBotao src={close} rotulo="Fechar" />
        </div>
      </header>

      <div className={s.miolo}>
        <div className={classesColuna}>{children}</div>
      </div>

      <div className={s.rodape}>
        <div className={s.progresso}>
          <div
            className={s.progressoPreenchido}
            style={{ width: `calc(${progresso * 100}% + 4px)` }}
          />
        </div>
        <div className={s.acoesRodape}>
          <Botao>Voltar</Botao>
          <div className={s.acoesDireita}>
            {mostrarPular ? <Botao>Pular</Botao> : null}
            {mostrarContinuar ? <Botao variante="marca">Continuar</Botao> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
