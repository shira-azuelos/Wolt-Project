document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        const registerLink = document.querySelector('.auth-switch-link a');
        if (redirectUrl && registerLink) {
              registerLink.href = `register.html?redirect=${redirectUrl}`;
        }
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await axios.post('http://localhost:3000/users/login', {
                    email,
                    password
                });
                
                if (response.status === 200) {
                    localStorage.setItem('userToken', response.data.token);
                    localStorage.setItem('userId', response.data.userId); 
                    localStorage.setItem('username', response.data.username);
                    localStorage.setItem('userStatus', response.data.status); 
                    localStorage.setItem('storeId', response.data.storeId);

                    const anonymousCartKey = 'anonymous_cart'; // --- לוגיקת מיזוג סלים ---
                    const userCartKey = `cart_${response.data.userId}`;
                    const anonymousCart = JSON.parse(sessionStorage.getItem(anonymousCartKey));
                    const userCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
                    if (anonymousCart && anonymousCart.length > 0) {
                        anonymousCart.forEach(anonymousItem => {  // מיזוג המוצרים מהסל האנונימי לסל של המשתמש
                            const existingItemIndex = userCart.findIndex(userItem => userItem.id === anonymousItem.id); 
                            if (existingItemIndex > -1) {
                                userCart[existingItemIndex].quantity += anonymousItem.quantity;// אם המוצר קיים כבר בסל של המשתמש, נוסיף את הכמות
                            } else {
                                userCart.push(anonymousItem);  // אם המוצר לא קיים, נוסיף אותו
                            }
                        });
                        localStorage.setItem(userCartKey, JSON.stringify(userCart));// שמירת הסל הממוזג במפתח של המשתמש
                        sessionStorage.removeItem(anonymousCartKey);// מחיקת הסל האנונימי
                    }
                    alert('התחברות בוצעה בהצלחה!');
                    if (redirectUrl) {
                        window.location.href = `../html/${redirectUrl}`;
                    } else {
                        window.location.href = '../../main.html';
                    }
                } else {
                    alert('שגיאה בהתחברות: ' + response.data.message);
                }
            } catch (error) {
                console.error('Login failed:', error.response ? error.response.data : error.message);
                const errorMessage = error.response && error.response.data && error.response.data.message
                                   ? error.response.data.message
                                   : 'אירעה שגיאה. אנא נסה שוב.';
                alert('שגיאה בהתחברות: ' + errorMessage);
            }
        });
    }
});