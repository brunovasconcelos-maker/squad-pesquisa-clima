import s from './Template.module.css'
import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'

import thermometerSimple from '../../assets/icons/ThermometerSimple.svg'
import starHalf from '../../assets/icons/StarHalf.svg'
import trayArrowDown from '../../assets/icons/TrayArrowDown.svg'
import userMinus from '../../assets/icons/UserMinus.svg'
import arrowUpRight from '../../assets/icons/ArrowUpRight.svg'
import plus from '../../assets/icons/Plus.svg'

/*
 * Tela 4 (Figma 8060:4673). Coluna larga: 808px em vez dos 532 das demais.
 *
 * O "Continuar" existe no Figma mas está com opacity 0 — some, sem deixar
 * buraco no rodapé. Por isso a moldura recebe mostrarContinuar={false}: o
 * resultado é o mesmo e evita um botão invisível clicável.
 *
 * As quebras de linha dos nomes vêm do Figma: "Pesquisa / de Clima" e
 * "Solicitação / Interna" são duas linhas; "Feedback" é uma linha alinhada
 * embaixo, e "Pesquisa de Desligamento" quebra sozinha na largura do cartão.
 */
const TEMPLATES = [
  { icone: thermometerSimple, nome: 'Pesquisa\nde Clima' },
  { icone: starHalf, nome: 'Feedback' },
  { icone: trayArrowDown, nome: 'Solicitação\nInterna' },
  { icone: userMinus, nome: 'Pesquisa de Desligamento' },
]

export default function TelaTemplate() {
  return (
    <FluxoLayout
      titulo="Feedback time de Design"
      progresso={4 / 6}
      larga
      mostrarContinuar={false}
    >
      <div className={s.conteudo}>
        <p className={s.rotulo}>Para que vai servir esse Pesquisa?</p>

        <div className={s.cartoes}>
          {TEMPLATES.map(({ icone, nome }) => (
            <button key={nome} type="button" className={s.cartao}>
              <span className={s.topoCartao}>
                <span className={s.selo}>
                  <img
                    className={s.icone}
                    src={icone}
                    alt=""
                    width={24}
                    height={24}
                  />
                </span>
                <img
                  className={s.icone}
                  src={arrowUpRight}
                  alt=""
                  width={24}
                  height={24}
                />
              </span>
              <span className={s.nomeCartao} style={{ whiteSpace: 'pre-line' }}>
                {nome}
              </span>
            </button>
          ))}
        </div>

        <button type="button" className={s.branco}>
          <span className={s.nomeBranco}>Criar pesquisa em Branco</span>
          <img
            className={s.icone}
            src={plus}
            alt=""
            width={24}
            height={24}
          />
        </button>
      </div>
    </FluxoLayout>
  )
}
