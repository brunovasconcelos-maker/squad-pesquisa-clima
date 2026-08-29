import { sincronizar } from './respostas.js'
import { sincronizarHistorico } from './historico.js'

/*
 * Depois de uma virada de status, as respostas e o histórico acertam o passo
 * na mesma gravação.
 *
 * Se esperassem o próximo giro do motor, as abas Respostas e Histórico
 * passariam até 30s mostrando o ciclo que acabou de fechar — pausar e ir
 * direto no Histórico mostraria uma linha a menos.
 */
export const acertarPasso = (p) => sincronizarHistorico(sincronizar(p))
