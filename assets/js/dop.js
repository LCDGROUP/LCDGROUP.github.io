// Открытие/закрытие бокового меню
document.querySelector('.header--nav-toggle').addEventListener('click', function(){
    document.querySelector('.outer-nav').classList.toggle('is-vis');
    document.querySelector('.container').classList.toggle('effect-rotate-left--animate');
});

// Закрытие меню по клику на "return"
document.querySelector('.outer-nav--return').addEventListener('click', function(){
    document.querySelector('.outer-nav').classList.remove('is-vis');
    document.querySelector('.container').classList.remove('effect-rotate-left--animate');
});

// Функция для переключения видимой секции
function openSection(sectionId) {
    // Закрываем меню, если оно было открыто
    document.querySelector('.outer-nav').classList.remove('is-vis');
    document.querySelector('.container').classList.remove('effect-rotate-left--animate');

    // Снимаем класс у текущей секции
    const current = document.querySelector('.section--is-active');
    if (current) current.classList.remove('section--is-active');

    // Добавляем класс нужной
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('section--is-active');
}

// Для совместимости с вашей разметкой
function scrollToSection(sectionId) {
    openSection(sectionId);
    return false; // чтобы отменить переход по href
}

// Функция для открытия бота ТН ВЭД
function openTnvedBot(e) {
    if (e) e.preventDefault();
    window.open('https://t.me/APP_LCD_Group_bot', '_blank');
    return false;
}

// Определяем связь между id секций и индексом пункта меню
const sectionToNavIndex = {
    'home': 0,
    'btn-tnved': 1,
    'calc-section': 2,
    'doc-section': 5,
    'track-section': 6,
    'about-section': 7
};

// Функция обновляет класс is-active у .outer-nav > li
function updateActiveNav(sectionId) {
    const navItems = document.querySelectorAll('.outer-nav > li');
    navItems.forEach(li => li.classList.remove('is-active'));

    // Если sectionId не задан или не найден — по умолчанию 0 (Главная)
    const idx = sectionToNavIndex[sectionId] || 0;
    if (navItems[idx]) navItems[idx].classList.add('is-active');
}

// Обновлённая функция открытия секции
function openSection(sectionId) {
    // Закрываем меню
    document.querySelector('.outer-nav').classList.remove('is-vis');
    document.querySelector('.outer-nav--return').classList.remove('is-vis');
    document.querySelector('.container').classList.remove('effect-rotate-left--animate');

    // Меняем видимую секцию
    const current = document.querySelector('.section--is-active');
    if (current) current.classList.remove('section--is-active');
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('section--is-active');

    // Отмечаем пункт меню
    updateActiveNav(sectionId);
}

// Обновлённая функция плавного перехода из главного экрана
function scrollToSection(sectionId) {
    openSection(sectionId);
    return false;
}

// Обработчики для пунктов меню
document.querySelectorAll('.outer-nav > li').forEach((li, i) => {
    li.addEventListener('click', (e) => {
        // нажатие по пункту i
        const ids = [
            'home',                    // индекс 0 - Главная
            'btn-tnved',               // индекс 1 - Подбор кода ТН ВЭД (особый случай)
            'calc-section',            // индекс 2 - Калькулятор
            'external-docs',           // индекс 3 - Заказать документы (внешняя ссылка)
            'external-suppliers',      // индекс 4 - База поставщиков (внешняя ссылка)
            'doc-section',             // индекс 5 - Консультация
            'track-section',           // индекс 6 - Отслеживание
            'about-section'            // индекс 7 - О нас
        ];

        const id = ids[i];

        if (id) {
            // Обработка специальных случаев
            if (id === 'btn-tnved') {
                openTnvedBot(e);
            }
            // Внешние ссылки - разрешаем стандартное поведение браузера
            else if (id === 'external-docs') {
                // Ничего не делаем - браузер сам откроет ссылку в новой вкладке
                // из-за target="_blank" в HTML
                closeMenu();
            }
            else if (id === 'external-suppliers') {
                // Ничего не делаем - браузер сам откроет ссылку в новой вкладке
                // из-за target="_blank" в HTML
                closeMenu();
            }
            // Внутренние секции
            else {
                openSection(id);
            }
        }

        // Закрываем меню после выбора
        closeMenu();
    });
});

// Функция для закрытия меню
function closeMenu() {
    document.querySelector('.outer-nav').classList.remove('is-vis');
    document.querySelector('.container').classList.remove('effect-rotate-left--animate');
}

// Глобальные функции для использования в onclick атрибутах
window.openSection = openSection;
window.scrollToSection = scrollToSection;
window.openTnvedBot = openTnvedBot;
