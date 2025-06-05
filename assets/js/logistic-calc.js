let productDatabase = [];

function loadProductDatabase() {
    return fetch('tws.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json(); // Парсим JSON напрямую
        })
        .then(data => {
            if (!Array.isArray(data)) throw new Error('Expected array');
            
            productDatabase = data.map(item => ({
                name: item['Наименование'] || '',
                code: item['Код'] || '',
                duty: parseDuty(item['Тариф']),
                details: item['Подробности'] || ''
            }));
            
            console.log('Loaded', productDatabase.length, 'products');
            return productDatabase;
        })
        .catch(error => {
            console.error('Error loading product database:', error);
            productDatabase = [];
            alert('Ошибка загрузки базы товаров. Пожалуйста, проверьте файл данных.');
            return [];
        });
}

function parseDuty(tariff) {
    if (!tariff) return 0.10; // По умолчанию 10%
    
    // Обрабатываем разные форматы:
    if (typeof tariff === 'number') return tariff / 100;
    
    const str = String(tariff).trim();
    if (str === '0%' || str === '0') return 0;
    
    const percent = parseFloat(str.replace('%', '').replace(',', '.'));
    return !isNaN(percent) ? percent / 100 : 0.10;
}

document.addEventListener('DOMContentLoaded', function() {
    loadProductDatabase().then(() => {
        // Таблица тарифов по плотности
        const densityRates = [
            { minDensity: 1000, rate: 0.625 },
            { minDensity: 800, rate: 0.675 },
            { minDensity: 600, rate: 0.725 },
            { minDensity: 500, rate: 0.775 },
            { minDensity: 400, rate: 0.800 },
            { minDensity: 350, rate: 0.850 },
            { minDensity: 300, rate: 0.875 },
            { minDensity: 250, rate: 0.900 },
            { minDensity: 200, rate: 0.925 },
            { minDensity: 190, rate: 0.950 },
            { minDensity: 180, rate: 0.975 },
            { minDensity: 170, rate: 1.000 },
            { minDensity: 160, rate: 1.025 },
            { minDensity: 150, rate: 1.050 },
            { minDensity: 140, rate: 1.100 },
            { minDensity: 130, rate: 1.150 },
            { minDensity: 120, rate: 1.200 },
            { minDensity: 110, rate: 1.250 },
            { minDensity: 100, rate: 1.300 }
        ];

        // Поиск товара
        const tnvedInput = document.getElementById('tnved-code');
        const suggestionsBox = document.getElementById('tnved-suggestions');

        if (tnvedInput && suggestionsBox) {
            const tnvedClear = document.createElement('button');
            tnvedClear.innerHTML = '🗑️';
            tnvedClear.className = 'clear-input-btn';
            tnvedClear.title = 'Очистить поле';
            tnvedClear.addEventListener('click', () => {
                tnvedInput.value = '';
                tnvedInput.focus();
            });
            tnvedInput.parentNode.insertBefore(tnvedClear, tnvedInput.nextSibling);

            tnvedInput.addEventListener('input', function() {
                const query = this.value.toLowerCase().trim();

                if (query.length < 2) {
                    suggestionsBox.style.display = 'none';
                    return;
                }

                // Ищем по коду и названию
                const suggestions = productDatabase.filter(item =>
                    item.code.toLowerCase().includes(query) || 
                    item.name.toLowerCase().includes(query)
                ).slice(0, 10); // Ограничиваем количество результатов

                suggestionsBox.innerHTML = '';

                if (suggestions.length > 0) {
                    suggestions.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        
                        // Выделяем код
                        const codeSpan = document.createElement('span');
                        codeSpan.className = 'suggestion-code';
                        codeSpan.textContent = item.code;
                        
                        // Выделяем название
                        const nameSpan = document.createElement('span');
                        nameSpan.className = 'suggestion-name';
                        nameSpan.textContent = item.name;
                        
                        // Добавляем пошлину
                        const dutySpan = document.createElement('span');
                        dutySpan.className = 'suggestion-duty';
                        dutySpan.textContent = ` (${(item.duty * 100).toFixed(0)}%)`;
                        
                        div.appendChild(codeSpan);
                        div.appendChild(document.createTextNode(' - '));
                        div.appendChild(nameSpan);
                        div.appendChild(dutySpan);
                        
                        div.addEventListener('click', () => {
                            tnvedInput.value = item.code;
                            suggestionsBox.style.display = 'none';
                        });
                        suggestionsBox.appendChild(div);
                    });
                    suggestionsBox.style.display = 'block';
                } else {
                    suggestionsBox.style.display = 'none';
                }
            });
        }

        // Форма расчета
        const calculatorForm = document.getElementById('delivery-calculator');
        
        if (calculatorForm) {
            calculatorForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // Получаем данные формы
                const fromCity = document.getElementById('route-from')?.value || '';
                const toCity = document.getElementById('route-to')?.value || '';
                const tnvedCode = document.getElementById('tnved-code')?.value || '';
                const transportType = document.querySelector('input[name="transport-type"]:checked')?.value || 'ltl';
                const weight = parseFloat(document.getElementById('product-weight')?.value) || 0;
                const volume = parseFloat(document.getElementById('product-volume')?.value) || 0;
                const quantity = parseInt(document.getElementById('product-quantity')?.value) || 1;
                const cost = parseFloat(document.getElementById('product-cost')?.value) || 0;
                const currency = document.getElementById('product-currency')?.value || 'usd';

                // Находим товар в базе для определения пошлины
                const product = productDatabase.find(item => 
                    item.code === tnvedCode || item.name.toLowerCase() === tnvedCode.toLowerCase()
                ) || { duty: 0.10, name: tnvedCode, code: '' };

                // Проверка на FTL с превышением лимитов
                if (transportType === 'ftl' && (weight > 26000 || volume > 70)) {
                    showResult(`
                        <div class="result-title">Результаты расчета</div>
                        <div class="result-grid">
                            <div class="result-item">
                                <span class="result-label">Тип перевозки:</span>
                                <span class="result-value">FTL (превышены лимиты)</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Вес:</span>
                                <span class="result-value">${weight} кг</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Объем:</span>
                                <span class="result-value">${volume} м³</span>
                            </div>
                            <div class="result-item total">
                                <span class="result-label">Для грузов свыше 26000 кг или 70 м³</span>
                                <span class="result-value">Свяжитесь с менеджером для получения спеццены</span>
                            </div>
                        </div>
                        <button id="contact-manager-btn" class="request-btn">Связаться с менеджером</button>
                    `, true);
                    return;
                }

                // Проверка на LTL с превышением лимитов
                if (transportType === 'ltl' && (weight > 26000 || volume > 70)) {
                    showResult(`
                        <div class="result-title">Результаты расчета</div>
                        <div class="result-grid">
                            <div class="result-item">
                                <span class="result-label">Тип перевозки:</span>
                                <span class="result-value">LTL (превышены лимиты)</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Вес:</span>
                                <span class="result-value">${weight} кг</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Объем:</span>
                                <span class="result-value">${volume} м³</span>
                            </div>
                            <div class="result-item total">
                                <span class="result-label">Для грузов свыше 26000 кг или 70 м³</span>
                                <span class="result-value">Свяжитесь с менеджером для получения спеццены</span>
                            </div>
                        </div>
                        <button id="contact-manager-btn" class="request-btn">Связаться с менеджером</button>
                    `, true);
                    return;
                }

                // Конвертируем стоимость в USD
                let costUSD = convertToUSD(cost, currency);

                // Рассчитываем плотность
                const density = volume ? weight / volume : 0;

                // Рассчитываем пошлину и НДС
                const duty = costUSD * product.duty;
                const vat = (costUSD + duty) * 0.2;

                // Рассчитываем стоимость доставки
                const { deliveryCost, deliveryRate } = calculateDeliveryCost(transportType, weight, volume, density);

                // Общая стоимость
                const totalCost = costUSD + duty + vat + deliveryCost;
                const unitCost = totalCost / (quantity || 1);

                // Отображаем результаты
                showResult(`
                    <div class="result-title">Результаты расчета</div>
                    <div class="result-grid">
                        <div class="result-item">
                            <span class="result-label">Маршрут:</span>
                            <span class="result-value">${getCityName('route-from')} → ${getCityName('route-to')}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Товар:</span>
                            <span class="result-value">${product.name} (${product.code || 'код не указан'})</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Тип перевозки:</span>
                            <span class="result-value">${transportType === 'ftl' ? 'FTL (полная загрузка)' : 'LTL (сборный груз)'}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Плотность груза (кг/м³):</span>
                            <span class="result-value">${density ? density.toFixed(2) : '—'}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Ставка доставки ($/кг):</span>
                            <span class="result-value">${deliveryRate.toFixed(4)}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Стоимость товара:</span>
                            <span class="result-value">${costUSD.toFixed(2)} $</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Таможенная пошлина (${(product.duty * 100).toFixed(1)}%):</span>
                            <span class="result-value">${duty.toFixed(2)} $</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">НДС (20%):</span>
                            <span class="result-value">${vat.toFixed(2)} $</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Стоимость доставки:</span>
                            <span class="result-value">${deliveryCost.toFixed(2)} $</span>
                        </div>
                        <div class="result-item total">
                            <span class="result-label">ИТОГО:</span>
                            <span class="result-value">${totalCost.toFixed(2)} $</span>
                        </div>
                        <div class="result-item total">
                            <span class="result-label">Стоимость единицы товара:</span>
                            <span class="result-value">${unitCost.toFixed(2)} $</span>
                        </div>
                    </div>
                    <button id="send-request-btn" class="request-btn">Отправить заявку</button>
                `, false);
            });
        }

        // Вспомогательные функции
        function convertToUSD(amount, currency) {
            const rates = { usd: 1, cny: 0.14, byn: 0.4, rub: 0.01 };
            return amount * (rates[currency] || 1);
        }

        function calculateDeliveryCost(transportType, weight, volume, density) {
            if (transportType === 'ftl') {
                return {
                    deliveryCost: 7000,
                    deliveryRate: weight ? 7000 / weight : 0
                };
            }

            // Находим ставку по плотности для LTL
            let deliveryRate = 0.35; // значение по умолчанию
            for (const { minDensity, rate } of densityRates) {
                if (density >= minDensity) {
                    deliveryRate = rate;
                    break;
                }
            }

            return {
                deliveryCost: deliveryRate * weight,
                deliveryRate
            };
        }

        function getCityName(selectId) {
            const select = document.getElementById(selectId);
            return select?.options[select.selectedIndex]?.text || '';
        }

        function showResult(html, isContactManager) {
            const resultSection = document.getElementById('calculation-result');
            if (!resultSection) return;

            resultSection.innerHTML = html;
            resultSection.style.display = 'block';

            if (isContactManager) {
                const contactBtn = document.getElementById('contact-manager-btn');
                if (contactBtn) {
                    contactBtn.addEventListener('click', contactManager);
                }
            } else {
                const sendBtn = document.getElementById('send-request-btn');
                if (sendBtn) {
                    sendBtn.addEventListener('click', sendRequest);
                }
            }

            resultSection.scrollIntoView({ behavior: 'smooth' });
        }

        function contactManager() {
            const name = prompt('Введите ваше имя:');
            const email = prompt('Введите ваш email:');
            const phone = prompt('Введите ваш телефон:');

            if (name && email && phone) {
                alert('Ваша заявка отправлена! Мы свяжемся с вами в ближайшее время.');
            }
        }

        function sendRequest() {
            const modalHTML = `
                <div class="modal-overlay" id="request-modal">
                    <div class="modal-content">
                        <h3>Отправить заявку</h3>
                        <div class="form-group-modal">
                            <label for="client-name">Ваше имя:</label>
                            <input type="text" id="client-name" required>
                        </div>
                        <div class="form-group-modal">
                            <label for="client-email">Email:</label>
                            <input type="email" id="client-email" required>
                        </div>
                        <div class="form-group-modal">
                            <label for="client-phone">Телефон:</label>
                            <input type="tel" id="client-phone" required>
                        </div>
                        <div class="form-group-modal">
                            <label for="client-comments">Комментарий:</label>
                            <input type="text" id="client-comments">
                        </div>
                        <div class="modal-buttons">
                            <button class="cancel-btn" id="cancel-request">Отмена</button>
                            <button class="submit-btn" id="submit-request">Отправить</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modal = document.getElementById('request-modal');
            modal.style.display = 'flex';

            document.getElementById('cancel-request').addEventListener('click', () => {
                modal.remove();
            });

            document.getElementById('submit-request').addEventListener('click', () => {
                const name = document.getElementById('client-name').value;
                const email = document.getElementById('client-email').value;
                const phone = document.getElementById('client-phone').value;
                const comments = document.getElementById('client-comments').value;

                if (!name || !email || !phone) {
                    alert('Пожалуйста, заполните обязательные поля');
                    return;
                }

                const formData = {
                    name,
                    email,
                    phone,
                    comments,
                    calculationData: getCalculationData()
                };

                sendEmail(formData);
                modal.remove();
                alert('Ваша заявка отправлена! Мы свяжемся с вами в ближайшее время.');
            });
        }

        function getCalculationData() {
            const resultItems = document.querySelectorAll('.result-item');
            let results = '';

            resultItems.forEach(item => {
                const label = item.querySelector('.result-label').textContent;
                const value = item.querySelector('.result-value').textContent;
                results += `${label} ${value}\n`;
            });

            return results;
        }

        function sendEmail(data) {
            const botToken = '7655942797:AAE99nRRdxePbzfuUNzlO92P3mclpfOnLbM';
            const chatIds = ['511108569', '465139726']; // Ваши chat_id

            const text = encodeURIComponent(`
        <b>🚚 Новая заявка на доставку</b>

        <b>👤 Контактные данные:</b>
        <i>Имя:</i> <b>${data.name || 'Не указано'}</b>
        <i>Телефон:</i> <code>${data.phone || 'Не указан'}</code>
        <i>Email:</i> <code>${data.email || 'Не указан'}</code>
        <i>Комментарий:</i> ${data.comments || 'Нет комментариев'}

        <b>📊 Данные расчета:</b>
        ${formatCalculationData(data.calculationData)}

        <i>📅 ${new Date().toLocaleString()}</i>
            `);

            // Отправляем каждому chat_id
            chatIds.forEach(chatId => {
                fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${text}&parse_mode=HTML`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Ошибка сети');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Успешно отправлено:', data);
                    })
                    .catch(error => {
                        console.error('Ошибка отправки:', error);
                    });
            });
        }

        function formatCalculationData(rawData) {
            if (!rawData) return 'Нет данных расчета';
            return rawData.split('\n')
                .filter(line => line.trim())
                .map(line => `<i>${line.replace(':', ':</i> <b>')}</b>`)
                .join('\n');
        }

        // Обработка формы консультации
        const consultForm = document.getElementById('consult-form');
        
        if (consultForm) {
            consultForm.addEventListener('submit', async function(e) {
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
                    showConsultResult('❌ Ошибка при отправке. Пожалуйста, попробуйте позже.', false);
                } finally {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }
    });
});