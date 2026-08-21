import s from './FluxoLayout.module.css'
import CabecalhoFluxo from './CabecalhoFluxo.jsx'
import RodapeFluxo from './RodapeFluxo.jsx'

/*
 * Moldura das telas do fluxo "Nova Pesquisa" (Figma 8057:3447 e irmãos).
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
  continuarDesabilitado = false,
  onFechar,
  onVoltar,
  onContinuar,
  onPular,
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
      <CabecalhoFluxo titulo={titulo} onFechar={onFechar} />

      <div className={s.miolo}>
        <div className={classesColuna}>{children}</div>
      </div>

      <RodapeFluxo
        progresso={progresso}
        mostrarContinuar={mostrarContinuar}
        mostrarPular={mostrarPular}
        continuarDesabilitado={continuarDesabilitado}
        onVoltar={onVoltar}
        onContinuar={onContinuar}
        onPular={onPular}
      />
    </div>
  )
}
