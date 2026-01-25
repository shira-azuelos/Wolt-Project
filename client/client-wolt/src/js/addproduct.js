document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('add-product-form');
    const messageArea = document.getElementById('message-area');

    const displayMessage = (message, type = 'success') => {
        messageArea.innerText = message;
        messageArea.className = `${type}-message`;
    };

    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const storeId = localStorage.getItem('storeId'); 
        if (!storeId) {
            displayMessage('שגיאה: לא נמצאה חנות מקושרת. אנא ודא שהתחברת כמנהל חנות.', 'error');
            return;
        }
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
        formData.append('store', storeId);
        if (imageFile) {
            formData.append('imageP', imageFile); 
        }
        const token = localStorage.getItem('userToken'); 
        if (!token) {
            displayMessage('שגיאה: טוקן אימות חסר. אנא התחבר מחדש.', 'error');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });
            displayMessage(`המוצר **${response.data.name}** הוסף בהצלחה!`, 'success');
            addProductForm.reset();
            window.location.href = 'managerP.html'; 

        } catch (error) {
            console.error("שגיאה בהוספת מוצר:", error);
            const errMsg = error.response?.data?.message || "אירעה שגיאה. אנא נסה שוב.";
            displayMessage(`שגיאה: ${errMsg}`, 'error');
        }
    });
});