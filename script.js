const saltyItems = document.getElementsByClassName('salty-items');
const drinksItems = document.getElementsByClassName('drinks-items');

let cartItems = [];
const cartElement = document.getElementById('cart-items');
const totalAmountElement = document.getElementById('total-amount');
const checkoutModal = document.getElementById('checkout-modal');
const orderSummary = document.getElementById('order-summary');

function changeItemQuantity(name, delta) {
  const quantityInput = document.getElementById(`quantity-${name}`);
  let quantity = parseInt(quantityInput.value) || 1;
  quantity = Math.max(1, quantity + delta);
  quantityInput.value = quantity;
}

function addToCart(name, price) {
  const quantity = 1;
  const existingItem = cartItems.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartItems.push({ name, price, quantity, included: true });
  }
  updateCart();
}

function removeToCart(name) {
  const existingItem = cartItems.find(item => item.name === name);
  if (existingItem) {
    cartItems = cartItems.filter(item => item.name !== name);
    updateCart();
  }
}

function updateCart() {
  cartElement.innerHTML = '';
  let totalAmount = 0;
  cartItems.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';

    const itemDetailsContainer = document.createElement('div');
    itemDetailsContainer.className = 'details-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.included;
    checkbox.addEventListener('change', function () {
      item.included = this.checked;
      updateCart();
    });

    const itemDetails = document.createElement('span');
    itemDetails.textContent = `${item.name}`;

    itemDetailsContainer.appendChild(checkbox);
    itemDetailsContainer.appendChild(itemDetails);

    const itemTotalAmount = document.createElement('span');
    itemTotalAmount.className = 'total-amount price';
    itemTotalAmount.textContent = `${formatFloatValue((item.price * item.quantity).toFixed(2))}`;

    const quantityControls = document.createElement('div');
    quantityControls.className = 'quantity-controls';

    const decrementButton = document.createElement('button');
    decrementButton.classList.add("mini-button");
    decrementButton.textContent = '-';
    decrementButton.onclick = () => changeQuantity(index, -1);

    const quantityInput = document.createElement('input');
    quantityInput.classList.add("small");
    quantityInput.type = 'number';
    quantityInput.value = item.quantity;
    quantityInput.onchange = (e) => setQuantity(index, parseInt(e.target.value));

    const incrementButton = document.createElement('button');
    incrementButton.classList.add("mini-button");
    incrementButton.textContent = '+';
    incrementButton.onclick = () => changeQuantity(index, 1);

    quantityControls.appendChild(decrementButton);
    quantityControls.appendChild(quantityInput);
    quantityControls.appendChild(incrementButton);

    const itemResumeContainer = document.createElement('div');
    itemResumeContainer.className = 'resume-container';

    itemResumeContainer.appendChild(itemTotalAmount);
    itemResumeContainer.appendChild(quantityControls);

    itemElement.appendChild(itemDetailsContainer);
    itemElement.appendChild(itemResumeContainer);

    cartElement.appendChild(itemElement);

    if (item.included) {
      totalAmount += item.price * item.quantity;
    }
  });
  totalAmountElement.textContent = formatFloatValue(totalAmount.toFixed(2));
}

function changeQuantity(index, delta) {
  const item = cartItems[index];
  if (delta === -1 && item.quantity === 1) {
    removeToCart(item.name);
  } else {
    item.quantity = Math.max(1, item.quantity + delta);
    updateCart();
  }
}

function setQuantity(index, quantity) {
  const item = cartItems[index];
  item.quantity = Math.max(1, quantity);
  updateCart();
}

document.getElementById('checkout').addEventListener('click', function () {
  if (!cartItems.length) {
    showToastMessage('Nenhum item foi adicionado no carrinho.')
    return;
  }

  showModal(checkoutModal);
  updateOrderSummary();
});

function updateOrderSummary() {
  orderSummary.innerHTML = `<h3 class="delivery-info">Itens no Carrinho</h3>`;

  const orderSummaryItems = document.createElement('div');
  orderSummaryItems.className = 'order-summary-items scrolling-container';

  cartItems.forEach(item => {
    if (item.included) {
      const summaryItem = document.createElement('div');
      summaryItem.classList.add("order-summary-item");
      // summaryItem.textContent = `${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`;
      summaryItem.textContent = `${item.quantity}x - ${item.name}`;
      orderSummaryItems.appendChild(summaryItem);
    }
  });
  orderSummary.appendChild(orderSummaryItems);
}

function showModal(modal) {
  modal.style.display = 'block';
}

function closeModal(modal) {
  modal.style.display = 'none';
}

document.getElementById('checkout-cancel').addEventListener('click', function () {
  closeModal(checkoutModal);
});

function showToastMessage(message, type = 'warning') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function finishOrder() {
  const customerNameInput = document.getElementById('customer-name');
  let name = customerNameInput.value;
  if (!name) {
    showToastMessage('Nome está inválido ou não foi inserido.');
    return;
  }

  const customerAddressInput = document.getElementById('customer-address');
  let address = customerAddressInput.value;
  if (!address) {
    showToastMessage('Endereço de entrega está inválido ou não foi inserido.');
    return;
  }

  if (name && address) {
    // reset cart state
    cartItems = [];
    totalAmountElement.textContent = formatFloatValue(0);
    cartElement.innerHTML = `<div class="no-items">
         </div>`;
    customerNameInput.value = '';
    customerAddressInput.value = '';

    closeModal(checkoutModal);
    showToastMessage('Pedido confirmado! Obrigado pela compra.', 'success');
  }
}

function formatFloatValue(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}
