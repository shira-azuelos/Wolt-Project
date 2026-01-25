document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();//במקום לשלוח לשרת אני מטפלת בזה לבד
            const firstname = document.getElementById('reg-firstname').value;
            const lastname = document.getElementById('reg-lastname').value;
            const addressInput = document.getElementById('reg-address').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const phone = document.getElementById('reg-phone').value;
            
            if (!firstname || !lastname) {
                alert('יש להזין שם פרטי ושם משפחה.');
                return;
            }
            const addressParts = addressInput.split(',').map(part => part.trim());
            if (addressParts.length < 2) {
                alert('יש להזין כתובת מלאה בפורמט: רחוב, עיר');
                return;
            }
            const street = addressParts[0];
            const city = addressParts.slice(1).join(', ');

            try {
                const response = await axios.post('http://localhost:3000/users', {
                    firstname,
                    lastname,
                    email,
                    password,
                    phone,
                    address: {
                        street,
                        city
                    }
                });

                if (response.status === 201) {
                    localStorage.setItem('userToken', response.data.token);
                    localStorage.setItem('userId', response.data.userId); 
                    localStorage.setItem('username', response.data.username);
                    localStorage.setItem('userStatus', response.data.status);

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
                   alert('הרשמה בוצעה בהצלחה!');
                    if (redirectUrl) {
                        window.location.href = `../html/${redirectUrl}`;
                    } else {
                      
                        window.location.href = '../../main.html';
                    }
                } else {
                    alert('שגיאה בהרשמה: ' + response.data.message);
                }
            } catch (error) {
                console.error('Registration failed:', error.response ? error.response.data : error.message);
                const errorMessage = error.response && error.response.data && error.response.data.message
                                   ? error.response.data.message
                                   : 'אירעה שגיאה בלתי צפויה. נסה שוב.';
                alert('שגיאה בהרשמה: ' + errorMessage);
            }
        });
    }
});