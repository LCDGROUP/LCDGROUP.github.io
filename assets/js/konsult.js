// konsult.js

document.addEventListener('DOMContentLoaded', function () {
    const consultForm = document.getElementById('consult-form');
    if (!consultForm) return;

    consultForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById('consult-submit');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        const name = document.getElementById('consult-name').value.trim();
        let telegram = document.getElementById('consult-telegram').value.trim();
        const phone = document.getElementById('consult-phone').value.trim();
        const message = document.getElementById('consult-message').value.trim();

        if (!telegram.startsWith('@') && telegram !== '') {
            telegram = '@' + telegram;
        }

        try {
            await sendConsultationRequest(name, telegram, phone, message);
            showConsultResult('✅ Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', true);
            consultForm.reset();
        } catch (error) {
            console.error('Ошибка отправки:', error);
            showConsultResult(`❌ Ошибка при отправке: ${error.message}`, false);
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    async function sendConsultationRequest(name, telegram, phone, message) {
        const botToken = '7655942797:AAE99nRRdxePbzfuUNzlO92P3mclpfOnLbM';
        const chatIds = ['511108569', '465139726']; // Массив chat_id админов

        const text = `
<b>📌 Новая заявка на консультацию</b>

<b>👤 Имя:</b> ${name || 'Не указано'}
<b>📱 Telegram:</b> ${telegram || 'Не указан'}
<b>📞 Телефон:</b> ${phone || 'Не указан'}
<b>💬 Вопрос:</b> ${message || 'Не указан'}

<i>🕒 ${new Date().toLocaleString()}</i>
        `;

        // Отправляем каждому админу
        for (const chatId of chatIds) {
            try {
                const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: text,
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    })
                });

                const data = await response.json();
                if (!data.ok) {
                    throw new Error(data.description || 'Unknown Telegram API error');
                }
            } catch (error) {
                console.error(`Ошибка отправки для chat_id ${chatId}:`, error);
                throw error; // Пробрасываем ошибку дальше
            }
        }
    }

    function showConsultResult(message, isSuccess) {
        const resultDiv = document.getElementById('consult-result');
        if (!resultDiv) return;
        
        resultDiv.textContent = message;
        resultDiv.style.color = isSuccess ? '#4CAF50' : '#F44336';
        resultDiv.style.display = 'block';
        resultDiv.style.padding = '15px';
        resultDiv.style.marginTop = '20px';
        resultDiv.style.borderRadius = '4px';
        resultDiv.style.backgroundColor = isSuccess ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
        resultDiv.style.border = `1px solid ${isSuccess ? '#4CAF50' : '#F44336'}`;

        setTimeout(() => {
            resultDiv.style.opacity = '0';
            setTimeout(() => {
                resultDiv.style.display = 'none';
                resultDiv.style.opacity = '1';
            }, 500);
        }, 5000);
    }
});
