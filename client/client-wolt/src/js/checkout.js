document.addEventListener('DOMContentLoaded', () => {
    const cartListContainer = document.getElementById('cart-list');
    const totalAmountSpan = document.getElementById('total-amount');
    const paymentForm = document.getElementById('payment-form');
    const userId = localStorage.getItem('userId');
    const cartKey = userId ? `cart_${userId}` : 'anonymous_cart';
    const storeId = localStorage.getItem('storeId');

    const renderCart = () => {
        const cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
        cartListContainer.innerHTML = '';
        let totalPrice = 0;
        if (cartItems.length === 0) {
            cartListContainer.innerHTML = '<p class="empty-cart-message">הסל שלך ריק. הוסף מוצרים כדי להתחיל!</p>';
            totalAmountSpan.innerText = '0';
            paymentForm.querySelector('button').disabled = true;
            return;
        }
        paymentForm.querySelector('button').disabled = false;
        const cartCards = cartItems.map(item => {
            const cartCard = document.createElement('div');
            cartCard.className = 'cart-item-card';
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'cart-item-details';
            detailsDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p>כמות: ${item.quantity}</p>
                <p>מחיר ליחידה: ₪${item.price}</p>
                <p>סה"כ: ₪${item.price * item.quantity}</p>
            `;
            cartCard.append(detailsDiv);
            totalPrice += item.price * item.quantity;
            return cartCard;
        });
        cartListContainer.append(...cartCards);
        totalAmountSpan.innerText = totalPrice.toFixed(2);
    };
    const validateCardDetails = () => {
        const cardNumber = document.getElementById('card-number').value;
        const cardName = document.getElementById('card-name').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCVV = document.getElementById('card-cvv').value;
        const cardNumberPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
        const cardExpiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const cardCVVPattern = /^\d{3}$/;
        if (!cardNumberPattern.test(cardNumber)) {
            alert('מספר הכרטיס אינו תקין. יש להזין בפורמט XXXX-XXXX-XXXX-XXXX');
            return false;
        }
        if (!cardName) {
            alert('יש להזין שם בעל הכרטיס.');
            return false;
        }
        if (!cardExpiryPattern.test(cardExpiry)) {
            alert('תאריך התוקף אינו תקין. יש להזין בפורמט MM/YY');
            return false;
        }
        if (!cardCVVPattern.test(cardCVV)) {
            alert('קוד האבטחה אינו תקין. יש להזין 3 ספרות.');
            return false;
        }
        return true;
    };

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();//במקום לשלוח לשרת אני מטפלת בזה לבד
        if (!validateCardDetails()) {
            return;
        }
        const cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
        if (cartItems.length === 0) {
            alert('הסל שלך ריק.');
            return;
        }
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
               displayMessage('שגיאה: טוקן אימות חסר. אנא התחבר מחדש.', 'error');
               return;
            }
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            await Promise.all(cartItems.map(async (item) => {// עובר על כל המוצרים שבסל ומעדכן את הכמות  
                const newAmount = item.amount - item.quantity;
                if (newAmount < 0) {
                    throw new Error(`אין מספיק מלאי מהמוצר: ${item.name}`);
                }
                await axios.put(`http://localhost:3000/products/${item.id}`, { amount: newAmount }, config);
            }));
            const productIds = cartItems.map(item => item.id);
            console.log(productIds)
            await axios.post('http://localhost:3000/orders', {
                productorder: productIds,
                user: userId,
                store: storeId
            });
            localStorage.removeItem(cartKey);
            alert('התשלום בוצע בהצלחה!');
            window.location.href = '../../main.html';
            localStorage.removeItem('storeId');
        } catch (error) {
            console.error('Checkout failed:', error); 
            const errorMessage = error.response && error.response.data && error.response.data.message
                               ? error.response.data.message
                               : error.message || 'אירעה שגיאה בלתי צפויה בתהליך התשלום. אנא נסה שוב.';
                               
            alert(`תשלום נכשל: ${errorMessage}`);
        }
    });

    renderCart();
});