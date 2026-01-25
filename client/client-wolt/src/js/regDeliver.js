document.addEventListener('DOMContentLoaded', () => {
    const joinButton = document.getElementById('join-button');
    const mainTitle = document.getElementById('main-title');
    const gifContainer = document.querySelector('.gif-container');
    const thankYouMessage = document.getElementById('thank-you-message');

    if (joinButton) {
        joinButton.addEventListener('click', async () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('userToken');
            if (!userId||!token) {
                alert('אינך רשום למערכת,אנא הרשם!');
                window.location.href = '../html/login.html';
                return;
            }
            try {
                const response = await axios.put(
                    `http://localhost:3000/users/${userId}`,
                    {
                        status: 'deliver'
                    },
                    { 
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.status === 200) {
                    localStorage.setItem('userStatus', 'deliver');
                    mainTitle.style.display = 'none';
                    gifContainer.style.display = 'none';
                    joinButton.style.display = 'none';
                    thankYouMessage.style.display = 'block';
                } else {
                    alert('אירעה שגיאה בעדכון הסטטוס שלך. אנא נסה שוב מאוחר יותר.');
                }

            } catch (error) {
                console.error("שגיאה בעדכון תפקיד המשתמש:", error);
                alert('אירעה שגיאה בעת הניסיון להצטרף. אנא ודא שהשרת פועל ונסה שוב.');
            }
        });
    }
});