const socket = io('http://localhost:3000'); 

socket.on('connect', () => {
    console.log('Manager connected to Socket.IO server.');
});

socket.on('finish_delivery_notification', (notification) => { 
    console.log('Manager received notification:', notification);
    if (notification.type === 'finish_delivery') {
        getFromServer();
        const notificationsDiv = document.getElementById('notifications');
        if (notificationsDiv) {
            const newMessage = document.createElement('div');
            const messageText = notification.text || "המשלוח הסתיים בהצלחה";
            newMessage.className = 'notification-message success-alert'; 
            newMessage.innerHTML = `<i class="fas fa-check-circle"></i> <strong>המשלוח הסתיים בהצלחה!</strong> ${messageText}`;
            notificationsDiv.prepend(newMessage);
            setTimeout(() => newMessage.remove(), 8000);
        }
    }
});
socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
});

socket.on('disconnect', () => {
    console.log('Socket.IO connection closed');
});
const createTableCell = (content, className = '') => {
    const cell = document.createElement('td');
    cell.innerText = content;
    if (className) cell.className = className;
    return cell;
};
const getFromServer = async () => {
    try {
        const storeId = localStorage.getItem('storeId');
        const token = localStorage.getItem('userToken'); 
        if (!token) {
            throw new Error("Token missing, please log in.");
        }
        const { data: ordersData } = await axios.get(
            `http://localhost:3000/orders?store=${storeId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            }
        );
        const tableBody = document.querySelector('#ordersTable tbody');
        tableBody.innerHTML = ''; 
        const relevantOrders = ordersData.filter(item => item.status === "waiting" || item.status === "finish");

        const finalOrders = await Promise.all(
            relevantOrders.map(async (item) => {
                let userDetails = null;
                const userId = item.user;
                if (userId && userId !== 'null') { 
                    try {
                        const { data } = await axios.get(
                            `http://localhost:3000/users/${userId}`,
                            {
                                headers: { 
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        );
                        userDetails = data; 
                    } catch (error) {
                        console.warn(`Failed to fetch user ${userId}(Token issue suspected):`, error.message);
                    }
                }
                return { ...item, user: userDetails }; 
            })
        );

        finalOrders.forEach(item => {
            const row = document.createElement('tr');
            const name = `${item.user?.firstname || ''} ${item.user?.lastname || ''}`.trim() || 'לא זמין';
            const email = item.user?.email || 'לא זמין';
            const street = item.user?.address?.street || '';
            const city = item.user?.address?.city || '';
            const address = street && city ? `${street}, ${city}` : (street || city || 'לא זמין');
            const date = item.date ? new Date(item.date).toLocaleDateString('he-IL') : 'לא זמין';

            row.appendChild(createTableCell(item._id));
            row.appendChild(createTableCell(name));
            row.appendChild(createTableCell(email));
            row.appendChild(createTableCell(address));
            row.appendChild(createTableCell(date));

            if (item.status === "waiting") {
                row.appendChild(createTableCell('ממתין', 'status-badge status-new'));
                const actionCell = document.createElement('td');
                const transferButton = document.createElement('button');
                transferButton.innerText = 'להעברה למשלוחן';
                transferButton.className = 'wolt-btn primary-btn transfer-btn';
                transferButton.onclick = () => transferOrder(item, transferButton);
                actionCell.appendChild(transferButton);
                row.appendChild(actionCell);

            } else if (item.status === "finish") {
                const finishCell = document.createElement('td');
                finishCell.colSpan = 2; 
                finishCell.className = 'finish-message-container'; 
                finishCell.innerHTML = `<span class="finish-message">העסקה בוצעה בהצלחה!!!!</span>`;
                row.appendChild(finishCell);
            }

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("שגיאה בטעינת הזמנות:", error);
        alert(`שגיאה בטעינת הזמנות: ${error.message}`);
    }
};

const transferOrder = async (item, transferButton) => {
    const token = localStorage.getItem('userToken'); 
    if (!token) {
        alert('שגיאה: טוקן אימות חסר. אנא התחבר מחדש.');
        return;
    }
    try {
        const url = `http://localhost:3000/orders/${item._id}`; 
        const updatedData = { status: "deliver" };
        await axios.put(url, updatedData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        transferButton.disabled = true; 
        transferButton.innerText = "הועבר למשלוחן"; 
        const notificationPayload = { 
            text: `הזמנה ${item._id} הועברה למשלוחן.`, 
            orderId: item._id,
            storeId: item.store,
            type: 'order_transferred'
        };
        socket.emit('order_transferred_to_deliver', notificationPayload); 
    
        const notificationsDiv = document.getElementById('notifications');
        if (notificationsDiv) {
            const newMessage = document.createElement('div');
            newMessage.className = 'notification-message new-order-alert'; 
            newMessage.innerHTML = `<i class="fas fa-shipping-fast"></i> <strong>ההזמנה הועברה!</strong> הזמנה ${item._id} הועברה בהצלחה למשלוחן.`;
            notificationsDiv.prepend(newMessage);
            setTimeout(() => newMessage.remove(), 4000);
        }
        getFromServer();
    } catch (error) {
        console.error("שגיאה בעדכון הסטטוס:", error.message);
    }
};

document.addEventListener('DOMContentLoaded', getFromServer);