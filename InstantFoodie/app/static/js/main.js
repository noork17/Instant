document.addEventListener('DOMContentLoaded', () => {
    // Safely parse JSON data passed from Django template
    const restaurants = JSON.parse(document.getElementById('restaurant-data').textContent);

    const viewMenuButtons = document.querySelectorAll('.view-menu-btn');
    const modal = document.getElementById('menu-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMenuItems = document.getElementById('modal-menu-items');
    const closeBtn = document.querySelector('.close-btn');

    const cartItemsList = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    let cart = [];

    // Filter restaurants based on cuisine
    const filterButtons = document.querySelectorAll('.filter-btn');
    const restaurantCards = document.querySelectorAll('.card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            button.classList.add('active');
            const filter = button.dataset.filter;

            restaurantCards.forEach(card => {
                if (filter === 'all' || card.dataset.cuisine === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    function renderCart() {
        cartItemsList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.classList.add('empty-cart-message');
            emptyMessage.textContent = 'Your cart is empty.';
            cartItemsList.appendChild(emptyMessage);
            checkoutBtn.disabled = true;
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('cart-item');
                li.innerHTML = `
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-plus" data-id="${item.id}">+</button>
                    </div>
                `;
                cartItemsList.appendChild(li);
                total += item.price * item.quantity;
            });
            checkoutBtn.disabled = false;
        }

        cartTotalPrice.textContent = `$${total.toFixed(2)}`;
    }

    viewMenuButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const restaurantId = parseInt(e.target.dataset.id);
            const restaurant = restaurants.find(r => r.id === restaurantId);

            if (restaurant) {
                modalTitle.textContent = restaurant.name;
                modalMenuItems.innerHTML = '';

                restaurant.menu.forEach(item => {
                    const menuItem = document.createElement('div');
                    menuItem.classList.add('menu-item');
                    menuItem.innerHTML = `
                        <span>${item.name} - $${item.price.toFixed(2)}</span>
                        <button class="add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">Add to Cart</button>
                    `;
                    modalMenuItems.appendChild(menuItem);
                });
                modal.style.display = 'block';
            }
        });
    });

    modalMenuItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const itemId = e.target.dataset.id;
            const itemName = e.target.dataset.name;
            const itemPrice = parseFloat(e.target.dataset.price);

            const existingItem = cart.find(item => item.id === itemId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id: itemId, name: itemName, price: itemPrice, quantity: 1 });
            }
            renderCart();
        }
    });

    cartItemsList.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('quantity-plus') || target.classList.contains('quantity-minus')) {
            const itemId = target.dataset.id;
            const cartItem = cart.find(item => item.id === itemId);

            if (!cartItem) return;

            if (target.classList.contains('quantity-plus')) {
                cartItem.quantity += 1;
            } else if (target.classList.contains('quantity-minus')) {
                cartItem.quantity -= 1;
                if (cartItem.quantity <= 0) {
                    cart = cart.filter(item => item.id !== itemId);
                }
            }
            renderCart();
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Redirecting to checkout... Your order is being processed!');
            cart = []; // Clear the cart after checkout
            renderCart();
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    renderCart(); // Initial render of the cart
});