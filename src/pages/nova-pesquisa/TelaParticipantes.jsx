import s from './Participantes.module.css'
import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'
import Botao from '../../components/fluxo/Botao.jsx'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import BlocoNome from './BlocoNome.jsx'

import checkSquare from '../../assets/icons/CheckSquare.svg'
import caretDown from '../../assets/icons/CaretDown.svg'
import search from '../../assets/icons/Search.svg'
import close from '../../assets/icons/Close.svg'

const GRUPOS = ['Atendimento', 'Vendas', 'Design']

function Item({ nome, contagem = '56 membros' }) {
  return (
    <div className={s.item}>
      <img className={s.caixa} src={checkSquare} alt="" width={24} height={24} />
      <p className={s.itemNome}>{nome}</p>
      <p className={s.itemContagem}>{contagem}</p>
    </div>
  )
}

/*
 * Tela 2 (Figma 8057:3674): o modal de participantes por cima da tela 1.
 *
 * O scrim do Figma é um retângulo de 1528x1140 centrado, ou seja, sangra para
 * fora da moldura — aqui vira um position: fixed cobrindo a viewport, que dá
 * o mesmo resultado sem depender do tamanho da tela.
 *
 * Todos os checkboxes usam CheckSquare.svg porque no Figma os quatro estão
 * marcados. O Square.svg (desmarcado) existe nos assets, mas nenhuma das seis
 * telas o utiliza.
 */
export default function TelaParticipantes() {
  return (
    <>
      <FluxoLayout titulo="Nova Pesquisa" progresso={2 / 6}>
        <BlocoNome participantes="Toda a empresa" />
      </FluxoLayout>

      <div className={s.scrim}>
        <div className={s.modal} role="dialog" aria-label="Participantes">
          <div className={s.cabecalho}>
            <p className={s.titulo}>Participantes</p>
            <IconeBotao src={close} rotulo="Fechar" />
          </div>

          <div className={s.grupos}>
            <Item nome="Toda empresa" />

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
                <Item key={grupo} nome={grupo} />
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
            <Botao>Voltar</Botao>
            <Botao variante="marca">Salvar</Botao>
          </div>
        </div>
      </div>
    </>
  )
}
