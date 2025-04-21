const updateXpResponse = await fetch('https://financial-backend-gc54.onrender.com/xp_handler.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken()
    },
    credentials: 'include',
    body: JSON.stringify({
        action: 'update_xp',
        xp_amount: xpAmount,
        lesson_id: lessonId
    })
});

const getXpResponse = await fetch('https://financial-backend-gc54.onrender.com/xp_handler.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken()
    },
    credentials: 'include',
    body: JSON.stringify({
        action: 'get_xp'
    })
});

const getCsrfToken = async () => {
    const response = await fetch('https://financial-backend-gc54.onrender.com/backend/get_csrf_token.php', {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    return data.token;
}; 