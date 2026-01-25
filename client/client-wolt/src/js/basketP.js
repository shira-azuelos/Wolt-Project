document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('storeId');
    const backLink = document.querySelector('.back-link');
    if (backLink && storeId) {
        backLink.href = `products.html?storeId=${storeId}`;
    }
    if (storeId) {
        localStorage.setItem('storeId', storeId);
    }
    const cartListContainer = document.getElementById('cart-list');
    const totalAmountSpan = document.getElementById('total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    const userId = localStorage.getItem('userId'); 
    const storage = userId ? localStorage : sessionStorage; 
    const cartKey = userId ? `cart_${userId}` : 'anonymous_cart';
    const renderCart = () => {
        const cartItems = JSON.parse(storage.getItem(cartKey)) || []; // טעינת הסל באמצעות המפתח המתאים
        cartListContainer.innerHTML = '';
        let totalPrice = 0;
        if (cartItems.length === 0) {
            cartListContainer.innerHTML = '<p class="empty-cart-message">הסל שלך ריק. הוסף מוצרים כדי להתחיל!</p>';
            totalAmountSpan.innerText = '0';
            checkoutBtn.disabled = true;
            return;
        }
        checkoutBtn.disabled = false;
        
        const newCartCards = cartItems.map(item => {
            const cartCard = document.createElement('div');
            cartCard.className = 'cart-item-card';
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            img.className = 'cart-item-image';
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'cart-item-details';
            detailsDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p>כמות: ${item.quantity}</p>
                <p>מחיר ליחידה: ₪${item.price}</p>
                <p>סה"כ: ₪${item.price * item.quantity}</p>
            `;
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-from-cart-btn';
            removeBtn.innerText = 'הסר';
            removeBtn.addEventListener('click', () => {
                const itemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
                if (itemIndex > -1) {
                    cartItems.splice(itemIndex, 1);
                    storage.setItem(cartKey, JSON.stringify(cartItems));
                    renderCart();
                    alert(`${item.name} הוסר מהסל.`);
                }
            });
            cartCard.append(img, detailsDiv, removeBtn);
            totalPrice += item.price * item.quantity;
            return cartCard;
        });
        cartListContainer.append(...newCartCards);
        totalAmountSpan.innerText = totalPrice.toFixed(2);
    };

    checkoutBtn.addEventListener('click', () => {
        const cartItems = JSON.parse(storage.getItem(cartKey)) || [];
        if (cartItems.length === 0) {
            alert('הסל שלך ריק. הוסף מוצרים כדי להתחיל!');
        } else if (!userId) {
            alert('כדי להשלים את ההזמנה, עליך להתחבר או להירשם.');
            window.location.href = '../html/login.html?redirect=basketP.html';//מנווט לדף ההתחברות
        } else {
            window.location.href = '../html/checkout.html';   // ניווט לדף התשלום
        }
    });
    
    renderCart();
});