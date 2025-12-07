// JavaScript: lógica do sistema de caixa do Mercado do Tio João

document.addEventListener('DOMContentLoaded', () => {
  // Referências aos elementos da tela (HTML)
  const clienteSelect = document.getElementById('clienteSelect');
  const btnChamarCliente = document.getElementById('btnChamarCliente');
  const clienteAtualEl = document.getElementById('clienteAtual');

  const qtdProdutoInput = document.getElementById('qtdProduto');
  const productButtons = document.querySelectorAll('.product-btn');

  const cartBody = document.getElementById('cartBody');
  const totalGeralEl = document.getElementById('totalGeral');

  const formaPagamentoSelect = document.getElementById('formaPagamento');
  const valorRecebidoInput = document.getElementById('valorRecebido');
  const trocoDisplay = document.getElementById('trocoDisplay');

  const btnCancelar = document.getElementById('btnCancelar');
  const btnFinalizar = document.getElementById('btnFinalizar');

  // Estado do carrinho em memória (lógica JS)
  let cart = [];

  // Formatação de moeda no padrão brasileiro
  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  // Atualiza o elemento visual do cliente atual
  function atualizarClienteAtual(nome) {
    clienteAtualEl.textContent = nome || 'Nenhum';
  }

  // Chamar cliente da fila
  btnChamarCliente.addEventListener('click', () => {
    const selected = clienteSelect.value;
    if (!selected) {
      alert('Selecione um cliente da fila primeiro.');
      return;
    }
    atualizarClienteAtual(selected);
  });

  // Função para adicionar item ao carrinho
  function adicionarAoCarrinho(nome, preco, quantidade) {
    if (quantidade <= 0 || isNaN(quantidade)) {
      alert('Informe uma quantidade válida.');
      return;
    }

    // Verifica se o produto já existe no carrinho
    const indexExistente = cart.findIndex((item) => item.name === nome);

    if (indexExistente >= 0) {
      cart[indexExistente].qty += quantidade;
    } else {
      cart.push({
        name: nome,
        price: preco,
        qty: quantidade
      });
    }

    renderizarCarrinho();
  }

  // Função para remover item por índice
  function removerItem(index) {
    cart.splice(index, 1);
    renderizarCarrinho();
  }

  // Calcula o total geral
  function calcularTotal() {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  }

  // Recalcula e exibe o troco
  function atualizarTroco() {
    const total = calcularTotal();
    const forma = formaPagamentoSelect.value;
    const valorRecebido = parseFloat(valorRecebidoInput.value || '0');

    if (forma === 'dinheiro' && valorRecebido > 0) {
      const troco = valorRecebido - total;
      trocoDisplay.textContent = troco >= 0 ? formatCurrency(troco) : `Falta ${formatCurrency(Math.abs(troco))}`;
    } else {
      trocoDisplay.textContent = formatCurrency(0);
    }
  }

  // Renderiza a tabela do carrinho na tela
  function renderizarCarrinho() {
    cartBody.innerHTML = '';

    cart.forEach((item, index) => {
      const tr = document.createElement('tr');

      const tdNome = document.createElement('td');
      tdNome.textContent = item.name;

      const tdQtd = document.createElement('td');
      tdQtd.textContent = item.qty;

      const tdPreco = document.createElement('td');
      tdPreco.textContent = formatCurrency(item.price);

      const tdTotal = document.createElement('td');
      tdTotal.textContent = formatCurrency(item.price * item.qty);

      const tdRemover = document.createElement('td');
      const btnRemover = document.createElement('button');
      btnRemover.className = 'remove-btn';
      btnRemover.textContent = 'remover';
      btnRemover.addEventListener('click', () => removerItem(index));
      tdRemover.appendChild(btnRemover);

      tr.appendChild(tdNome);
      tr.appendChild(tdQtd);
      tr.appendChild(tdPreco);
      tr.appendChild(tdTotal);
      tr.appendChild(tdRemover);

      cartBody.appendChild(tr);
    });

    const total = calcularTotal();
    totalGeralEl.textContent = formatCurrency(total);
    atualizarTroco();
  }

  // Eventos dos botões de produto (cada clique adiciona item com a quantidade selecionada)
  productButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price || '0');
      const qty = parseInt(qtdProdutoInput.value || '1', 10);

      adicionarAoCarrinho(name, price, qty);

      // Depois de adicionar, volta quantidade para 1
      qtdProdutoInput.value = '1';
    });
  });

  // Atualizar troco ao mudar forma de pagamento ou valor recebido
  formaPagamentoSelect.addEventListener('change', atualizarTroco);
  valorRecebidoInput.addEventListener('input', atualizarTroco);

  // Cancelar compra: limpa carrinho e campos
  btnCancelar.addEventListener('click', () => {
    if (!cart.length && !clienteAtualEl.textContent) return;

    const confirmar = confirm('Deseja realmente cancelar esta compra?');
    if (!confirmar) return;

    cart = [];
    renderizarCarrinho();
    formaPagamentoSelect.value = '';
    valorRecebidoInput.value = '';
    trocoDisplay.textContent = formatCurrency(0);
  });

  // Finalizar venda: valida dados e “conclui” o atendimento
  btnFinalizar.addEventListener('click', () => {
    if (!cart.length) {
      alert('O carrinho está vazio.');
      return;
    }

    if (!clienteAtualEl.textContent || clienteAtualEl.textContent === 'Nenhum') {
      alert('Nenhum cliente em atendimento. Chame um cliente antes de finalizar.');
      return;
    }

    if (!formaPagamentoSelect.value) {
      alert('Selecione uma forma de pagamento.');
      return;
    }

    const total = calcularTotal();
    const forma = formaPagamentoSelect.value;

    if (forma === 'dinheiro') {
      const valorRecebido = parseFloat(valorRecebidoInput.value || '0');
      if (valorRecebido < total) {
        alert('O valor recebido em dinheiro é insuficiente.');
        return;
      }
    }

    alert(
      `Venda finalizada!\n\nCliente: ${clienteAtualEl.textContent}\nTotal: ${formatCurrency(
        total
      )}\nForma de pagamento: ${forma.toUpperCase()}`
    );

    // Após finalizar: limpa carrinho e volta estado inicial
    cart = [];
    renderizarCarrinho();
    formaPagamentoSelect.value = '';
    valorRecebidoInput.value = '';
    trocoDisplay.textContent = formatCurrency(0);
    clienteSelect.value = '';
    atualizarClienteAtual('Nenhum');
  });

  // Inicializa exibição
  renderizarCarrinho();
});
