import s from './Carregando.module.css'

/*
 * Tela de carregamento do caminho com template. Sem Figma ainda; vira vídeo
 * mais para a frente.
 *
 * FALTA O ASSET: a ilustração do Pipo na mesa não está em src/assets/images —
 * a pasta só tem os dois avatares da sidebar e o Frame 2147223608 (o ícone do
 * módulo). O palco abaixo fica vazio de propósito: desenhar uma caixa ou um
 * spinner no lugar seria inventar um placeholder.
 *
 * Quando o arquivo chegar, é um import e um <img className={s.ilustracao}>
 * dentro do palco. Quando virar vídeo, um <video> no mesmo lugar.
 */
export default function TelaCarregando() {
  return (
    <div className={s.tela}>
      <div className={s.palco} />
    </div>
  )
}
