# squad-pesquisa-clima

Módulo Pesquisa de Clima da suíte Squad. React + Vite, deploy no GitHub Pages
por Actions a cada push em `main`.

## Como trabalhar aqui

**Verificação: modo médio.** Build local sempre, mais um smoke-test curto no
navegador (as rotas carregam, nada quebrado no console, imagens resolvem).
Não percorrer todos os estados e casos de borda a cada tarefa — verificação
completa só quando pedida, em mudanças grandes de UI.

**Build antes de commitar, sempre.** `npm run build` é barato e é o que
garante que o que sobe compila.

**Deploy:** o workflow leva 30–48s. Esperar um intervalo compatível e checar
o status uma vez, em vez de consultar de tantos em tantos segundos.

**Screenshots:** só quando houver algo específico a confirmar ou sinalizar.

## Assets

Ícones e imagens ficam em `src/assets/icons` e `src/assets/images`, com o nome
exato da layer do Figma. Se algo referenciado no Figma não estiver lá,
reportar qual falta — não substituir por placeholder ou forma genérica.

## Convenções

- Tokens de design em `src/styles/tokens.css`; nada de hex solto nos módulos.
- O Figma desenha em SF Pro; os pesos 510 e 590 viram 500 e 600 no Inter.
- Inter é servida local por `@fontsource/inter`, sem CDN.
- CSS Modules por componente, comentários em português explicando o porquê
  das medidas que vieram do Figma.
