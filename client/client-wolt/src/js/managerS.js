const getManagerStoreId = async (managerId) => {
    try {
        const url = `http://localhost:3000/stores`;
        const { data } = await axios.get(url, {
            params: { manager: managerId }
        });
        if (data.length > 0) {
            return data[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching manager's store:", error);
        return null;
    }
};

const displayMessage = (message, type = 'success') => {
    const messageArea = document.getElementById('message-area');
    messageArea.innerHTML = message;
    messageArea.className = '';
    messageArea.classList.add(`${type}-message`);
};

const renderStoreForm = (store) => {
    document.getElementById('store-management-title').innerText = `ניהול החנות: ${store.name}`;
    document.getElementById('store-id').value = store._id;
    document.getElementById('store-name').value = store.name;
    document.getElementById('store-street').value = store.address.street;
    document.getElementById('store-city').value = store.address.city;
    document.getElementById('store-phone').value = store.phone;
    document.getElementById('store-type').value = store.typeS;
    document.getElementById('store-cat').value = store.catS;
    const currentstoreImage = document.getElementById('current-store-image');
    if (store.imageS) {
        const correctedPath = store.imageS.replace('./', '../../');
        currentstoreImage.src = correctedPath;
    } else {
        currentstoreImage.style.display = 'none';
    }
};
document.addEventListener('DOMContentLoaded', async () => {
    const managerId = localStorage.getItem('userId');
    const storeForm = document.getElementById('store-form');
    const deleteBtn = document.getElementById('delete-store-btn');
    let currentStore = await getManagerStoreId(managerId);
    if (currentStore) {
        renderStoreForm(currentStore);
    } else {
        document.getElementById('store-management-title').innerText = 'הוספת חנות חדשה';
        displayMessage('לא נמצאה חנות מקושרת. אנא מלא את הפרטים והוסף חנות חדשה.', 'error');
        deleteBtn.style.display = 'none';
    }

    storeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const storeId = document.getElementById('store-id').value;
        const name = document.getElementById('store-name').value;
        const street = document.getElementById('store-street').value;
        const city = document.getElementById('store-city').value;
        const phone = document.getElementById('store-phone').value;
        const typeS = document.getElementById('store-type').value;
        const catS = document.getElementById('store-cat').value;
        const imageFile = document.getElementById('store-image').files[0]; 

        const formData = new FormData();
        formData.append('name', name);
        formData.append('address[street]', street); 
        formData.append('address[city]', city); 
        formData.append('phone', phone);
        formData.append('typeS', typeS);
        formData.append('catS', catS);
        formData.append('manager', managerId);
        if (imageFile) {
            formData.append('imageS', imageFile);
        }
        const token = localStorage.getItem('userToken'); 
        if (!token) {
            displayMessage('שגיאה: טוקן אימות חסר. אנא התחבר מחדש.', 'error');
            return;
        }
        try {
            let response;
            const apiPath = `http://localhost:3000/stores${storeId ? '/' + storeId : ''}`;
            const method = storeId ? 'put' : 'post';
            response = await axios({
                method: method,
                url: apiPath,
                data: formData,
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            if (storeId) {
                displayMessage(`החנות ${name} עודכנה בהצלחה!`, 'success');
            } else {
                currentStore = response.data;
                document.getElementById('store-id').value = currentStore._id;
                deleteBtn.style.display = 'inline-block';
                displayMessage(`החנות ${name} נוצרה בהצלחה!`, 'success');
            }
            renderStoreForm(response.data);

        } catch (error) {
            console.error("Error saving store:", error);
            const errMsg = error.response?.data?.message || "שגיאה בשמירת פרטי החנות.";
            displayMessage(`שגיאה: ${errMsg}`, 'error');
        }
    });
    deleteBtn.addEventListener('click', async () => {
        const storeId = document.getElementById('store-id').value;
        if (!storeId) return;

        if (!confirm("האם את בטוחה שברצונך למחוק את החנות הזו?")) {
            return;
        }
        const token = localStorage.getItem('userToken'); 
        if (!token) {
            displayMessage('שגיאה: טוקן אימות חסר. אנא התחבר מחדש.', 'error');
            return;
        }
        try {
            await axios.delete(`http://localhost:3000/stores/${storeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            alert("החנות נמחקה בהצלחה!!");
            window.location.href = 'mangerMain.html'; 
        } catch (error) {
            console.error("Error deleting store:", error);
            displayMessage("שגיאה במחיקת החנות.", 'error');
        }
    });
});

