document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        try {
            const url = `http://localhost:3000/stores`;
            const { data } = await axios.get(url, {
               params: { manager: userId }
            });
            if (Array.isArray(data) && data.length > 0) {
                const storeObject = data[0]; 
                const storeId = storeObject._id || storeObject.id || storeObject.storeId;
                if (storeId) {
                    localStorage.setItem('storeId', storeId); 
                    console.log(`Store ID ${storeId} saved successfully.`);
                } else {
                    console.error("שגיאה: מזהה החנות (ID) לא נמצא באובייקט שחזר.", storeObject);
                }
            } else {
                console.error("שגיאה: לא נמצאה חנות מקושרת למשתמש זה. הנתונים שחזרו:", data);
            }
        } catch (error) {
            console.error("שגיאה בשליפת פרטי החנות:", error);
        }
    }
});