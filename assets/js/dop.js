// Открытие/закрытие бокового меню (если у вас нет этого в custom.js)
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
// Определяем связь между id секций и индексом пункта меню
const sectionToNavIndex = {
    'calc-section': 1,
    'doc-section': 2,
    'track-section': 3,
    'about-section': 4
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
  
  // И, при желании, чтобы пункты меню тоже переключали секции:
  document.querySelectorAll('.outer-nav > li').forEach((li, i) => {
    li.addEventListener('click', () => {
      // нажатие по пункту i
      const ids = [null, 'calc-section', 'doc-section', 'track-section', 'about-section'];
      const id = ids[i];
      if (id) openSection(id);
    });
  });
    