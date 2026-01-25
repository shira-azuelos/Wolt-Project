const getFromServer = async (query = '') => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let storeId = urlParams.get('storeId');
        if (!storeId) {
            storeId=localStorage.getItem('storeId')
        }
        const cartLink = document.querySelector('.cart-container-main');
        if (cartLink && storeId) {
            cartLink.href = `../html/basketP.html?storeId=${storeId}`;
        }
        let url = 'http://localhost:3000/products';
        const params = {};
        if (storeId) {
            params.storeId = storeId;
        }
        if (query) {
            params.name = query;
        }
        const { data } = await axios.get(url, { params });
        const container = document.querySelector('#restaurants-list');
        container.innerHTML = '';

        const userId = localStorage.getItem('userId');//בודק אם משתמש מחובר
        const storage = userId ? localStorage : sessionStorage;
        const cartKey = userId ? `cart_${userId}` : 'anonymous_cart';//אם לא קיים יוצר סל גלובלי
        let cartItems = JSON.parse(storage.getItem(cartKey)) || [];//טעינת סל במוצרים הקיים ואם אין מאתחל במערך חדש

        const newProductCards = data.map(item => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            const img = document.createElement('img');
            img.src = item.imageP;
            img.alt = item.name;
            img.className = 'product-image';
            const h2 = document.createElement('h2');
            h2.innerText = item.name;
            h2.className = 'restaurant-name';
            const pPrice = document.createElement('p');
            pPrice.className = 'product-price';
            pPrice.innerText = `מחיר: ₪${item.price}`;
            const pDesc = document.createElement('p');
            pDesc.className = 'product-description';
            pDesc.innerText = item.describe || 'אין תיאור זמין.';
            const pAmount = document.createElement('p');
            pAmount.className = 'product-amount';
            pAmount.innerText = `מלאי קיים: ${item.amount}`;

            const ActDiv = document.createElement('div');
            ActDiv.className = 'product-actions';
            const DecAndIncDiv = document.createElement('div');
            DecAndIncDiv.className = 'quantity-control';
            const decreaseBtn = document.createElement('button');
            decreaseBtn.className = 'quantity-btn decrease';
            decreaseBtn.innerText = '-';
            const amountDisplay = document.createElement('span');
            amountDisplay.className = 'quantity-display';
            amountDisplay.innerText = '1';
            const increaseBtn = document.createElement('button');
            increaseBtn.className = 'quantity-btn increase';
            increaseBtn.innerText = '+';
            const CartBtn = document.createElement('button');
            CartBtn.className = 'add-to-cart-btn';
            CartBtn.innerText = 'הוספה לסל';
            DecAndIncDiv.append(decreaseBtn, amountDisplay, increaseBtn);
            ActDiv.append(DecAndIncDiv, CartBtn);
            productCard.append(img, h2, pPrice, pDesc, pAmount, ActDiv);

            increaseBtn.addEventListener('click', () => {//הוספת כמות
                let currentQuantity = parseInt(amountDisplay.innerText);
                if (currentQuantity < item.amount) {
                    amountDisplay.innerText = currentQuantity + 1;
                } else {
                    alert(`אין מספיק מלאי מהמוצר: ${item.name}`);
                }
            });
            decreaseBtn.addEventListener('click', () => {//הפחת כמות
                let currentQuantity = parseInt(amountDisplay.innerText);
                if (currentQuantity > 1) {
                    amountDisplay.innerText = currentQuantity - 1;
                }
            });

            CartBtn.addEventListener('click', () => {
                const quantity = parseInt(amountDisplay.innerText);
                const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item._id);//בודק האם המוצר קיים כבר בסל
                if (existingItemIndex > -1) {//אם קיים
                    const newQuantity = cartItems[existingItemIndex].quantity + quantity;
                    if (newQuantity > item.amount) {
                        alert(`לא ניתן להוסיף כמות כזו. במלאי נשארו ${item.amount - cartItems[existingItemIndex].quantity} יחידות.`);
                        return;
                    }
                    cartItems[existingItemIndex].quantity = newQuantity;
                } else {
                    cartItems.push({
                        id: item._id,
                        name: item.name,
                        price: item.price,
                        image: item.imageP,
                        quantity: quantity,
                        amount: item.amount
                    });
                }
                item.amount -= quantity;
                pAmount.innerText = `מלאי קיים: ${item.amount}`;
                storage.setItem(cartKey, JSON.stringify(cartItems));
                alert(`${quantity} יחידות של ${item.name} הוספו לסל!`);
            });

            return productCard;
        });
        container.append(...newProductCards);
    } catch (error) {
        alert(error.message);
    }
};
function enableMarqueeLoop() {
    const marquee = document.getElementById('reviews-marquee');    
    if (!marquee || marquee.children.length === 0) {
        console.warn("אלמנט ה-Marquee ריק או לא נמצא. לא ניתן לשכפל.");
        return;
    }
    const originalContent = Array.from(marquee.children);     
    originalContent.forEach(node => {
        const clone = node.cloneNode(true); // שכפול עמוק כולל כל התוכן
        clone.removeAttribute('id'); 
        marquee.appendChild(clone);
    });
}
const renderReviews = (reviews) => {
    const marqueeContainer = document.getElementById('reviews-marquee');
    if (!marqueeContainer) return;
    const reviewsToRender = reviews; 
    marqueeContainer.innerHTML = '';     
    reviewsToRender.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        const filledStars = '&#9733;'.repeat(review.derug || 0); // כוכב מלא
        const emptyStars = '&#9734;'.repeat(5 - (review.derug || 0)); // כוכב ריק
        const starsHtml = filledStars + emptyStars;
        reviewCard.innerHTML = `
            <div class="review-header">
                <span class="review-name">${review.nameO || 'לקוח אנונימי'}</span>
                <div class="review-stars">${starsHtml}</div>
            </div>
            <p class="review-description">${review.describe || 'הלקוח בחר שלא לפרט'}</p>
        `;
        marqueeContainer.appendChild(reviewCard);
    });
    enableMarqueeLoop(); 
    if (reviews.length < 4) { 
        marqueeContainer.classList.add('no-scroll');
    }
};

const fetchAndRenderStoreReviews = async (storeId) => {
    if (!storeId) return;
    try {
        const url = `http://localhost:3000/stores/${storeId}`; 
        const { data: store } = await axios.get(url);
        if (store && store.openion && store.openion.length > 0) {
            renderReviews(store.openion);
        } else {
            const reviewsSection = document.querySelector('.reviews-section');
            if(reviewsSection) reviewsSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching store reviews:', error.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value;
            getFromServer(query);
        });
    }
    getFromServer();
    const urlParams = new URLSearchParams(window.location.search);
    let storeId = urlParams.get('storeId');
    if (!storeId) {
        storeId=localStorage.getItem('storeId')
    }
    
    if (storeId) {
        fetchAndRenderStoreReviews(storeId); // **הפעלת הפונקציה החדשה**
    }
});