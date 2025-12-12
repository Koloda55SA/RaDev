// ========================================
// БЫСТРЫЙ СКРИПТ ДЛЯ ОТЛАДКИ - ВСТАВЬТЕ В КОНСОЛЬ
// Этот скрипт создаст функцию window.debugGoogle() которую можно вызывать в любой момент
// ========================================

window.debugGoogle = function() {
  console.log('========================================');
  console.log('🔍 ЗАПУСК ОТЛАДКИ GOOGLE OAUTH');
  console.log('========================================');
  
  // Находим кнопку
  const buttons = Array.from(document.querySelectorAll('button'));
  const googleButton = buttons.find(btn => {
    const text = btn.textContent || btn.innerText || '';
    return text.includes('Google') || text.includes('Войти через Google');
  });
  
  if (!googleButton) {
    console.error('❌ Кнопка Google не найдена!');
    return;
  }
  
  console.log('✅ Кнопка найдена:', googleButton);
  
  // Добавляем обработчик
  googleButton.addEventListener('click', function(e) {
    console.log('========================================');
    console.log('🎯 КНОПКА GOOGLE НАЖАТА!');
    console.log('========================================');
    console.log('Event:', e);
    console.log('Target:', e.target);
    console.log('Button:', googleButton);
    console.log('URL перед редиректом:', window.location.href);
    
    // Сохраняем информацию
    sessionStorage.setItem('googleButtonClicked', JSON.stringify({
      timestamp: Date.now(),
      url: window.location.href
    }));
  }, true);
  
  // Мониторинг всех кликов
  document.addEventListener('click', function(e) {
    if (googleButton.contains(e.target) || e.target === googleButton) {
      console.log('🖱️ КЛИК ПО КНОПКЕ GOOGLE ОБНАРУЖЕН!');
    }
  }, true);
  
  // Перехватываем редиректы
  const originalReplace = window.location.replace;
  window.location.replace = function(url) {
    console.log('========================================');
    console.log('🔄 РЕДИРЕКТ НА:', url);
    console.log('========================================');
    if (url.includes('google.com') || url.includes('accounts.google')) {
      console.log('✅ Это редирект на Google OAuth!');
      sessionStorage.setItem('googleRedirect', url);
    }
    return originalReplace.call(this, url);
  };
  
  console.log('✅ Отладка настроена!');
  console.log('Нажмите на кнопку Google и смотрите логи');
  
  return googleButton;
};

// Автоматически запускаем при загрузке
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Автозапуск отладки...');
    window.debugGoogle();
  });
} else {
  console.log('🚀 Автозапуск отладки...');
  window.debugGoogle();
}

// Проверяем, был ли клик до перезагрузки
const clicked = sessionStorage.getItem('googleButtonClicked');
if (clicked) {
  console.log('📋 Предыдущий клик найден:', JSON.parse(clicked));
  sessionStorage.removeItem('googleButtonClicked');
}

// Проверяем OAuth параметры
const urlParams = new URLSearchParams(window.location.search);
const hash = window.location.hash;
if (urlParams.has('__firebase_request_key') || hash.includes('access_token') || hash.includes('id_token')) {
  console.log('========================================');
  console.log('🔍 OAuth ПАРАМЕТРЫ В URL!');
  console.log('========================================');
  console.log('Search:', window.location.search);
  console.log('Hash:', hash.substring(0, 200));
  console.log('Full URL:', window.location.href);
}

console.log('✅ Функция window.debugGoogle() доступна');
console.log('Вызовите debugGoogle() в любой момент для повторной настройки');

