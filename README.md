# 3D Manager — Calculadora de Custos para Impressão 3D

Web app hospedado no **Google Apps Script**, integrado ao **Google Sheets** como banco de dados. Calcula o custo real de uma peça impressa em 3D, sugere preço de venda e salva o pedido na planilha.

---

## Estrutura do Projeto

O Apps Script não suporta subpastas — todos os arquivos ficam na raiz. A convenção adotada usa prefixos nos nomes:

| Prefixo | Tipo | Conteúdo |
|---------|------|----------|
| `Tela*.html` | HTML puro | Estrutura/UI de cada tela |
| `CSS*.html` | `<style>` tag | Estilos de cada módulo |
| `JS*.html` | `<script>` tag | Lógica client-side de cada módulo |
| `Código.js` | Apps Script (server) | Funções que acessam o Google Sheets |
| `Index.html` | Template raiz | Layout principal + `<?!= include(...) ?>` |
| `appsscript.json` | Manifesto | Config do webapp (timezone, acesso) |
| `.clasp.json` | clasp | Config de deploy local → GAS |

### Fluxo de montagem

O Apps Script usa **HTML Templating**. O `Index.html` usa `<?!= include('NomeDoArquivo') ?>` para injetar o conteúdo dos outros arquivos no HTML final entregue ao browser. É equivalente a um SSR simples.

```
Código.js (server)
    └── doGet() → renderiza Index.html como template
            ├── include('CSSMenu')
            ├── include('CSSDarkModeCalculadora')
            ├── include('TelaCalculadora') → include('JSCalculadora')
            └── include('TelaPedidos')    → include('JSPedidos')
```

---

## Telas

### Calculadora (ativa)
Formulário de cálculo de custo de impressão 3D em 3 seções:

1. **Custo de Impressão** — filamento (R$/kg × peso em gramas) + energia (kWh × watts × horas) + taxa de falha opcional
2. **Custos Variáveis** — compra de peça pronta, frete, campos extras dinâmicos (pintura, lixa, acabamento...)
3. **Fechamento** — margem de lucro (%), preço de venda manual ou sugerido, observação

O painel de resultados mostra em tempo real:
- Custo de produção, compra, extras, frete
- **Custo total geral**
- Sugestão de preço (custo × margem)
- **Lucro líquido**

Ao salvar, o pedido é gravado na aba `Pedidos` do Sheets via `google.script.run`.

### Histórico de Pedidos (placeholder)
Tela existe mas ainda não carrega dados (função `carregarListaPedidos()` comentada no código).

### Clientes / Modelos (desabilitadas)
Comentadas no `Index.html`. Arquivos HTML/JS existem mas não estão sendo incluídos.

---

## Backend — `Código.js`

Funções server-side chamadas via `google.script.run` no client:

| Função | O que faz |
|--------|-----------|
| `doGet()` | Entry point — renderiza o template HTML |
| `include(filename)` | Helper para importar arquivos HTML dentro de outros |
| `salvarPedido(dados)` | Salva linha completa na aba `Pedidos` |
| `salvarCliente(form)` | Adiciona novo cliente na aba `Clientes` |
| `getListaClientes()` | Retorna array de clientes para o dropdown |
| `getProximoNumero()` | Gera ID de pedido (lastRow + UUID curto de 8 chars) |
| `excluirClientePorLinha(linha)` | Remove cliente pelo número da linha |
| `pedido()` | Gera UUID curto (8 chars sem hífens) |

**Google Sheets esperadas:**
- Aba `Clientes` — colunas: data, id, nome, telefone
- Aba `Pedidos` — colunas: num_pedido, data, cliente, modelo, medidas, obs, preço_venda, preço_sugerido, lucro_total, %lucro, custo_total, filamento, material_g, duração_h, taxa_energia, consumo_w, custo_peça, consumo_filamento, consumo_energia

---

## Deploy

O projeto usa [clasp](https://github.com/google/clasp) para sincronizar o código local com o Google Apps Script.

```bash
# Instalar clasp (uma vez)
npm install -g @google/clasp

# Autenticar
clasp login

# Enviar arquivos para o GAS
clasp push

# Abrir no editor online
clasp open
```

O `scriptId` em `.clasp.json` aponta para o projeto GAS vinculado à planilha.

Para publicar como webapp: no editor GAS → **Implantar → Novo Implantação → Aplicativo da Web**.

---

## Roadmap (TODOs do código)

- [ ] add calculo de depreciação
- [ ] add calculo do valor da impressora
- [ ] Adicionar cálculo do valor da impressora e depreciação
- [ ] Enviar orçamento via WhatsApp (mensagem ou PDF)
- [ ] Enviar via whatsapp (msg ou PDF)
- [ ] estudar sobre backups
- [ ] Exportar dados
- [ ] Gerar PDF
- [ ] Gerar PDF do pedido
- [ ] i18n / locale baseado no browser
- [ ] Layout mobile-friendly
- [ ] Locale (tradução baseado no browser)
- [ ] MELHORAR TODOS OS CÓDIGOS
- [ ] Móbile Friendly
- [ ] Navegação: Listagem de Clientes
- [ ] Navegação: Listagem de Peças
- [ ] Navegação: Listagem de Pedidos
- [ ] Navegação: Listagem de Pedidos com edição (replicar tabela atual com datas, código de rastreio, pago ou não etc)
- [ ] possibilidade de exportar dados
- [ ] registrar nome do usuário que está usando via gmail (eu ou o vinis) 
- [ ] Registrar qual usuário salvou (via Gmail)
- [ ] Salvar todos os dados do formulário na tabela de Pedidos
- [ ] Tela de listagem de Clientes com edição/exclusão
- [ ] Tela de listagem de Peças/Modelos
- [ ] Tela de listagem de Pedidos com status (rastreio, pago, data)
- [ ] Validar campos obrigatórios
- [ ] Validar e salvar todos os campos do formulário corretamente em `Pedidos`
- [ ] Valores padrões caso o campo esteja em branco
- [x] Tema escuro