const getManagerStoreId = async (managerId) => {
    try {
        const url = `http://localhost:3000/stores`;
        const { data } = await axios.get(url, {
            params: { manager: managerId } 
        });
        if (data.length > 0) {
            return data[0]._id;
        }
        return null;
    } catch (error) {
        console.error("Error fetching manager's store:", error);
        return null;
    }
};

const fetchAndRenderProducts = async (storeId) => {
    const tableBody = document.querySelector('#products-table tbody');
    tableBody.innerHTML = '';
    if (!storeId) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">לא נמצאה חנות מקושרת למנהל זה.</td></tr>';
        return;
    }
    try {
        const url = `http://localhost:3000/products`;
        const { data: products } = await axios.get(url, {
            params: { storeId: storeId }
        });
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">אין מוצרים בחנות זו.</td></tr>';
            return;
        }
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.imageP}" alt="${product.name}" class="product-image"></td>
                <td>${product.name}</td>
                <td>₪${product.price.toFixed(2)}</td>
                <td>${product.amount}</td>
                <td>${product.catP}</td>
                <td>${product.isSale ? '✅' : '❌'}</td>
                <td>
                    <div class="action-buttons-group">
                        <button class="action-btn edit-btn" data-id="${product._id}">
                            <i class="fas fa-edit"></i> עדכון
                        </button>
                        <button class="action-btn delete-btn" data-id="${product._id}">
                            <i class="fas fa-trash-alt"></i> מחיקה
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleEdit(e.currentTarget.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleDelete(e.currentTarget.dataset.id, storeId));
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">אירעה שגיאה בטעינת המוצרים.</td></tr>';
    }
};

const handleAdd = () => {
    window.location.href = 'addproduct.html';
};

const handleEdit = (productId) => {
    window.location.href = `updateProduct.html?id=${productId}`;
};

const handleDelete = async (productId, storeId) => {
    const token = localStorage.getItem('userToken'); 
    if (!token) {
        alert('שגיאה: טוקן אימות חסר. אנא התחבר מחדש.');
        return;
    }

    try {
        await axios.delete(`http://localhost:3000/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        alert('המוצר נמחק בהצלחה!');
        fetchAndRenderProducts(storeId);
    } catch (error) {
        console.error("Error deleting product:", error);
        alert('שגיאה במחיקת המוצר.');
    }
};


document.addEventListener('DOMContentLoaded', async () => {
    const managerId = localStorage.getItem('userId');
    const addProductBtn = document.getElementById('add-product-btn');
    const currentStoreId = await getManagerStoreId(managerId);
    if (currentStoreId) {
        fetchAndRenderProducts(currentStoreId);
        addProductBtn.addEventListener('click', handleAdd);
    } else {
         document.querySelector('.page-title').innerText = 'אין חנות מקושרת למשתמש זה';
         addProductBtn.disabled = true;
    }
});