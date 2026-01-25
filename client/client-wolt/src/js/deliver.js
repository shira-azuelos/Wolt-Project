const socket = io('http://localhost:3000'); 

socket.on('connect', () => {
    console.log('Connected to Socket.IO server for courier updates');
});

socket.on('new_delivery_notification', (notification) => {
    console.log('Received notification:', notification);
    if (notification.type === 'new_delivery') {
        const notificationsDiv = document.getElementById('notifications');
        if (notificationsDiv) {
            const newMessage = document.createElement('div');
            newMessage.className = 'notification-message new-order-alert'; 
            const messageText = notification.text || "הזמנה חדשה למשלוח";
            newMessage.innerHTML = `<i class="fas fa-bell"></i> <strong>הזמנה חדשה למשלוח!</strong> ${messageText}`;
            notificationsDiv.prepend(newMessage); 
            setTimeout(() => newMessage.remove(), 8000);
        }
        getFromServer();
    }
});

socket.on('disconnect', () => {
    console.log('Socket.IO connection closed');
});

socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
});

const getFromServer = async () => {
    try {
         const token = localStorage.getItem('userToken'); 
        if (!token) {
            throw new Error("Token missing, please log in.");
        }
        const config = { 
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        };
        const { data: ordersData } = await axios.get(
            `http://localhost:3000/orders`,
            config 
        );
        const tableBody = document.querySelector('#ordersTable tbody');
        tableBody.innerHTML = ''; 
        const finalOrdersPromises = ordersData.map(async (item) => {
            const userId = item.user;
            const storeId = item.store; 
            let userDetails = null;
            let storeDetails = null;            
            if (userId ) {
                try {
                    const { data: userData } = await axios.get(`http://localhost:3000/users/${userId}`, config);
                    userDetails = userData;
                } catch (error) {
                    console.warn(`Failed to fetch user ${userId} for order ${item._id}:`, error.message);
                }
            }            
            if (storeId) {
                try {
                    if (typeof storeId === 'object' && storeId !== null) {
                         storeDetails = storeId;
                    } else if (typeof storeId === 'string') {
                         const { data: storeData } = await axios.get(`http://localhost:3000/stores/${storeId}`, config);
                         storeDetails = storeData;
                    }

                } catch (error) {
                    console.warn(`Failed to fetch store ${storeId} for order ${item._id}:`, error.message);
                }
            }
            
            return { //מחזיר את ההזמנה
                ...item, 
                user: userDetails,
                store: storeDetails
            };
        });
        
        const finalOrders = await Promise.all(finalOrdersPromises);
        finalOrders.forEach(item => {
            const row = document.createElement('tr');
            const customerName = `${item.user?.firstname || ''} ${item.user?.lastname || ''}`.trim() || 'שם לא זמין';
            const customerAddress = item.user?.address?.street && item.user?.address?.city 
                ? `${item.user.address.street}, ${item.user.address.city}` 
                : 'כתובת לא זמינה';
            const storeName = item.store?.name || 'חנות לא ידועה'; 
            const orderDate = new Date(item.date).toLocaleDateString('he-IL') || 'לא זמין';
            const orderIdCell = document.createElement('td');
            orderIdCell.innerText = item._id; 
            row.appendChild(orderIdCell);
            const customerNameCell = document.createElement('td');
            customerNameCell.innerText = customerName;
            row.appendChild(customerNameCell);
            const storeNameCell = document.createElement('td');
            storeNameCell.innerText = storeName;
            row.appendChild(storeNameCell);
            const customerAddressCell = document.createElement('td');
            customerAddressCell.innerText = customerAddress;
            row.appendChild(customerAddressCell);
            const orderDateCell = document.createElement('td');
            orderDateCell.innerText = orderDate;
            row.appendChild(orderDateCell);
            const actionCell = document.createElement('td');
            const transferButton = document.createElement('button');
            transferButton.innerText = 'ללקיחת המשלוח';
            transferButton.className = 'wolt-btn primary-btn deliver-btn';
            
            transferButton.onclick = () => transferOrder(item._id, storeName, customerName, transferButton); 
            actionCell.appendChild(transferButton);
            row.appendChild(actionCell);

            tableBody.appendChild(row); 
        });

    } catch (error) {
        console.error("שגיאה בטעינת הזמנות:", error);
        alert(`שגיאה בטעינת הזמנות: ${error.message}`);
    }
};

const transferOrder = async (orderId, storeName, customerName, buttonElement) => {
    if (!orderId) {
        alert("שגיאה: חסר מספר הזמנה לביצוע העברה.");
        return;
    }
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert("Token missing, please log in.");
        return;
    }
    
    try {
        const url = `http://localhost:3000/orders/${orderId}`; 
        const updatedData = { status: "finish" }; 
        
        buttonElement.innerText = "מעדכן...";
        buttonElement.disabled = true;        
       await axios.put(url, updatedData, {
           headers: { 'Authorization': `Bearer ${token}` }
       });
       
        buttonElement.innerText = "המשלוח בוצע בהצלחה!"; 
        const messagePayload = { 
            type: 'finish_delivery',
            orderId: orderId, 
        };
        socket.emit('finish_delivery_from_courier', messagePayload);
        setTimeout(getFromServer, 1000); 

    } catch (error) {
        console.error("שגיאה בהעברת הזמנה:", error.response?.data?.message || error.message);
        alert(`שגיאה בהעברת הזמנה: ${error.response?.data?.message || error.message || 'שגיאה לא ידועה'}`);
        buttonElement.innerText = 'ללקיחת המשלוח';
        buttonElement.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', getFromServer);