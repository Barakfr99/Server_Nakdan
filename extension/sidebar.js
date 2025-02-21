let selectedOption = null;

const API_URL = 'https://your-app-name.railway.app/nikud';  // יש להחליף בכתובת האמיתית

document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('wordInput');
    const getNikudButton = document.getElementById('getNikud');
    const nikudList = document.getElementById('nikudList');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const status = document.getElementById('status');

    if (!wordInput || !getNikudButton || !nikudList || !loading || !error || !status) {
        console.error('חסרים אלמנטים נדרשים בדף');
        return;
    }

    getNikudButton.addEventListener('click', async () => {
        const word = wordInput.value.trim();
        
        // Reset UI
        nikudList.innerHTML = '';
        error.style.display = 'none';
        status.style.display = 'none';
        
        if (!word) {
            error.textContent = 'אנא הכנס מילה';
            error.style.display = 'block';
            return;
        }

        try {
            loading.style.display = 'block';
            getNikudButton.disabled = true;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ word }),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error('שגיאה בקבלת הניקוד');
            }

            const data = await response.json();
            
            if (!data.options || data.options.length === 0) {
                throw new Error('לא נמצאו אפשרויות ניקוד');
            }

            displayNikudOptions(data.options);

        } catch (err) {
            error.textContent = err.message;
            error.style.display = 'block';
        } finally {
            loading.style.display = 'none';
            getNikudButton.disabled = false;
        }
    });

    async function copyTextToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err2) {
                console.error('שגיאה בהעתקה:', err2);
                return false;
            }
        }
    }

    function createNikudOption(option) {
        const li = document.createElement('li');
        li.className = 'option-item';
        li.textContent = option;
        
        li.addEventListener('click', async () => {
            const success = await copyTextToClipboard(option);
            if (success) {
                status.textContent = 'הועתק ללוח!';
                status.style.display = 'block';
                setTimeout(() => {
                    status.style.display = 'none';
                }, 2000);
            } else {
                error.textContent = 'שגיאה בהעתקה ללוח';
                error.style.display = 'block';
            }
        });
        
        return li;
    }

    async function displayNikudOptions(options) {
        nikudList.innerHTML = '';
        options.forEach(option => {
            if (option && typeof option === 'string') {
                const li = createNikudOption(option);
                nikudList.appendChild(li);
            }
        });
    }
});

document.getElementById('applyNikud').addEventListener('click', async () => {
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';

    try {
        if (!selectedOption) {
            throw new Error('אנא בחר אפשרות ניקוד');
        }

        await chrome.runtime.sendMessage({
            action: 'replaceText',
            text: selectedOption
        });
    } catch (error) {
        console.error('Error applying nikud:', error);
        errorMessage.textContent = error.message || 'אירעה שגיאה בעת החלפת הטקסט';
        errorMessage.style.display = 'block';
    }
});

async function getNikudOptions(word) {
    if (!word || typeof word !== 'string') {
        throw new Error('מילה לא תקינה');
    }

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getNikudOptions',
            word: word
        });

        if (!response) {
            throw new Error('לא התקבלה תשובה מהשרת');
        }

        if (response.error) {
            throw new Error(response.error);
        }

        return response.options;
    } catch (error) {
        console.error('Error getting nikud options:', error);
        throw error;
    }
} 