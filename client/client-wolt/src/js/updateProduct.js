document.addEventListener('DOMContentLoaded', () => {
    const updateProductForm = document.getElementById('update-product-form');
    const messageArea = document.getElementById('message-area');
    const currentProductImage = document.getElementById('current-product-image');
    const productNameTitle = document.getElementById('product-name-title');
    const storeId = localStorage.getItem('storeId'); 
    let productId = null;
    let baseURL = 'http://localhost:3000'; 

    const displayMessage = (message, type = 'success') => {
        messageArea.innerText = message;
        messageArea.className = `${type}-message`;
        messageArea.classList.remove('hidden');
    };

    const getProductIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    const loadProductData = async (id) => {
        
        try {
            const url = `${baseURL}/products?_id=${id}`;
            const response = await axios.get(url);
            const product = response.data[0]; 

            if (!product) {
                displayMessage('שגיאה: מוצר לא נמצא.', 'error');
                return;
            }

            productNameTitle.innerText = `עדכון מוצר: ${product.name}`;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-amount').value = product.amount;
            document.getElementById('product-cat').value = product.catP;
            document.getElementById('product-describe').value = product.describe;
            
            if (product.imageP) {
                 currentProductImage.src = product.imageP; 
            } else {
                 currentProductImage.style.display = 'none';
            }

        } catch (error) {
            console.error('שגיאה בטעינת נתוני המוצר:', error);
            displayMessage('שגיאה בטעינת נתוני המוצר.', 'error');
        }
    };
    updateProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        const name = document.getElementById('product-name').value;
        const price = document.getElementById('product-price').value;
        const amount = document.getElementById('product-amount').value;
        const catP = document.getElementById('product-cat').value;
        const describe = document.getElementById('product-describe').value;
        const imageFile = document.getElementById('product-image').files[0]; 

        formData.append('name', name);
        formData.append('price', price);
        formData.append('amount', amount);
        formData.append('catP', catP);
        formData.append('describe', describe);
        
        if (imageFile) {
            formData.append('imageP', imageFile); 
        }         
       const token = localStorage.getItem('userToken'); 
        if (!token) {
            displayMessage('שגיאה: טוקן אימות חסר. אנא התחבר מחדש.', 'error');
            return;
        }
        try {
            const url = `${baseURL}/products/${productId}`;
            const response = await axios.put(url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            displayMessage(`המוצר **${response.data.name}** עודכן בהצלחה!`, 'success');
            window.location.href = 'managerP.html'; 

        } catch (error) {
            console.error('שגיאה בעדכון המוצר:', error.response ? error.response.data : error.message);
            
            const errorMessage = error.response && error.response.data && error.response.data.message 
                               ? error.response.data.message 
                               : 'שגיאה כללית בעדכון המוצר. אנא בדוק את הנתונים.';
                               
            displayMessage(errorMessage, 'error');
        }
    });
    
    productId = getProductIdFromUrl();
    if (productId) {
        loadProductData(productId);
    } else {
        displayMessage('שגיאה: חסר מזהה מוצר לעדכון.', 'error');
    }
});

