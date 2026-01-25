const socket = io('http://localhost:3000');

const userId = localStorage.getItem('userId');
socket.on('connect', () => {
    console.log('Connected to server-client');
    if (userId) {
        socket.emit('register', userId);
    } else {
        console.error('User ID is not defined');
    }
});

socket.on('message', (data) => {
    const { message, store } = data;
    console.log(message);
    console.log(store);
    const dialog = document.querySelector('.divmessage');
    const initialMessage = document.getElementById('initial-message');
    const ratingContainer = document.getElementById('rating-container');
    const stars = document.querySelectorAll('.star');
    let ratingValue = 0;
    const closeDialog = () => {
        dialog.style.display = 'none';
        dialog.setAttribute('hidden', '');
        document.getElementById('comment').value = '';
        ratingValue = 0;
        stars.forEach(s => s.classList.remove('selected'));
    };
    if (message) {
        dialog.removeAttribute('hidden');
        dialog.style.display = 'flex';
        initialMessage.style.display = 'flex';
        ratingContainer.style.display = 'none';
    }

    stars.forEach(star => {
        star.addEventListener('click', () => {
            ratingValue = star.getAttribute('data-value');
            stars.forEach(s => {
                s.classList.remove('selected');
            });
            for (let i = 0; i < ratingValue; i++) {
                stars[i].classList.add('selected');
            }
        });
    });

    document.getElementById('submit').addEventListener('click', async () => {
        const comment = document.getElementById('comment').value;
        const token = localStorage.getItem('userToken');
        if (!token) {
           return;
        }
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };      
        if (ratingValue > 0 && comment) {
            const url = `http://localhost:3000/stores/${store}`; 
            const newOpinion = { derug: ratingValue, nameO: localStorage.getItem('username') || "אנונימי", describe: comment }; 
            const updatedData = { openion: [newOpinion] }; 
            try {
                await axios.put(url, updatedData,config);
                alert('חוות הדעת נשלחה בהצלחה, תודה שדרגת😊');
                closeDialog(); 
                
            } catch (error) {
                console.error("Error updating data:", error.response ? error.response.data : error.message);
                alert(`שגיאה בעדכון חוות הדעת: ${error.response ? error.response.data.message : error.message}`);
            }
        } else {
            alert('אנא ספק דירוג ותגובה.');
        }
    });

    document.getElementById('continue-button').addEventListener('click', () => {
        initialMessage.style.display = 'none'; 
        ratingContainer.style.display = 'flex';
    });
    document.getElementById('close-message-btn').addEventListener('click', closeDialog);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

const renderStores = (allStores) => {
    const container = document.querySelector('#shop-list');
    container.innerHTML = '';
    const newArr = allStores.map(item => {
        const storeDiv = document.createElement('div');
        storeDiv.className = 'store-card';
        const link = document.createElement('a');
        link.href = `src/html/products.html?storeId=${item._id}`;
        const img = document.createElement('img');
        img.src = item.imageS;
        img.alt = item.name;
        const h2 = document.createElement('h2');
        h2.innerText = item.name;
        link.appendChild(img);
        const address = document.createElement('p');
        address.className = 'store-address';
        address.innerText = `כתובת: ${item.address.street}, ${item.address.city}`;
        const phone = document.createElement('p');
        phone.className = 'store-phone';
        phone.innerText = item.phone;
        storeDiv.append(link, h2, address, phone);
        return storeDiv;
    });
    container.append(...newArr);
};

const getStoresByType = async (type) => {
    try {
        const url = `http://localhost:3000/stores`;
        let response;
        if (type) {
            response = await axios.get(url, { params: { typeS: type } });
        } else {
            response = await axios.get(url);
        }
        const allStores = response.data;
        const titleElement = document.getElementById('stores-title'); 
        if (type === 'shop') {
            titleElement.innerText = 'חנויות באזור שלי';
        } else if (type === 'resturant') {
            titleElement.innerText = 'מסעדות באזור שלי';
        } else {
            titleElement.innerText = 'חנויות ומסעדות באזור שלי';
        }
        renderStores(allStores);
    } catch (error) {
        console.error('Error fetching stores:', error.message);
    }
};

const getBySearch = async (query) => {
    try {
        const response = await axios.get(`http://localhost:3000/stores?name=${query}`);
        const allStores = response.data;
        renderStores(allStores);
    } catch (error) {
        console.error('Error fetching stores:', error.message);
    }
};

const getStoresByCategory = async (category) => {
    try {
        const url = `http://localhost:3000/stores`;
        const response = await axios.get(url, { params: { catS: category } });
        const allStores = response.data;
        renderStores(allStores);
    } catch (error) {
        console.error('Error fetching stores by category:', error.message);
    }
};

const updateUIForLoggedInUser = () => {
    const userToken = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');
    const userStatus = localStorage.getItem('userStatus');
    const authNavUl = document.querySelector('.auth-nav ul');
    const BtnContainer = document.getElementById('button-container');
    const promoBar = document.getElementById('courier-promo-bar');
    if (userToken && username) {
        if (authNavUl) {
            authNavUl.innerHTML = `
                <li>שלום, ${username}</li>
                <li><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> יציאה</a></li>
            `;
            const logoutBtn = document.getElementById('logout-btn');
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                localStorage.removeItem('userStatus'); 
                window.location.reload();
            });
        }
        if (promoBar) {
            promoBar.style.display = 'flex'; 
        }
        if (userStatus === 'menager' && BtnContainer) {
            BtnContainer.innerHTML = `
                <a href="#" id="my-stores-btn" class="header-manager-btn">
                    <i class="fas fa-store"></i> החנויות שלי
                </a>
            `;
            const myStoresBtn = document.getElementById('my-stores-btn');
            if (myStoresBtn) {
                myStoresBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = '../client-wolt/src/html/mangerMain.html'; 
                });
            }
            if (promoBar) {
               promoBar.style.display = 'none';
            }
        }
        if (userStatus === 'deliver' && BtnContainer) {
            BtnContainer.innerHTML = `
                <a href="#" id="my-orders-btn" class="header-manager-btn">
                    <i class="fas fa-motorcycle"></i>לקיחת משלוח
                </a>
            `;
            const myOrdersBtn = document.getElementById('my-orders-btn');
            if (myOrdersBtn) {
                myOrdersBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = '../client-wolt/src/html/deliver.html'; 
                });
            }
            if (promoBar) {
               promoBar.style.display = 'none';
            }
        }
    }
};
const fetchAndPopulateCategories = async () => {
    try {
        const response = await axios.get('http://localhost:3000/stores');
        const allStores = response.data;
        const uniqueCategories = [...new Set(allStores.map(store => store.catS))]; // יצירת מערך של קטגוריות
        const categoryFilter = document.getElementById('category-filter');
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error.message);
    }
};
document.addEventListener('DOMContentLoaded', () => {
    updateUIForLoggedInUser();
    fetchAndPopulateCategories();
    const searchInput = document.getElementById('search-site');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value;
            getBySearch(query);
        });
    }
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (event) => {
            const selectedCategory = event.target.value;
            getStoresByCategory(selectedCategory);
        });
    }
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const type = button.getAttribute('data-type');
            getStoresByType(type);
        });
    });
    getStoresByType(''); 
});
