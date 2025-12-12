// ========================================
// СКРИПТ ДЛЯ ОТЛАДКИ GOOGLE OAUTH В КОНСОЛИ
// Скопируйте весь этот код и вставьте в консоль браузера (F12)
// Скрипт автоматически восстановится после перезагрузки страницы
// ========================================

// Сохраняем скрипт в localStorage для автовосстановления
if (!localStorage.getItem('googleOAuthDebugScript')) {
  localStorage.setItem('googleOAuthDebugScript', 'true');
  console.log('📝 Скрипт сохранен в localStorage для автовосстановления');
}

(function() {
  console.log('========================================');
  console.log('🔍 НАЧАЛО ОТЛАДКИ GOOGLE OAUTH');
  console.log('========================================');
  
  // 1. Проверяем наличие кнопки
  console.log('\n[1] Проверка кнопки Google...');
  const buttons = document.querySelectorAll('button');
  let googleButton = null;
  
  buttons.forEach((btn, index) => {
    const text = btn.textContent || btn.innerText || '';
    console.log(`  Кнопка ${index}: "${text.substring(0, 50)}"`);
    if (text.includes('Google') || text.includes('Войти через Google')) {
      googleButton = btn;
      console.log(`  ✅ Найдена кнопка Google на индексе ${index}`);
    }
  });
  
  if (!googleButton) {
    console.error('  ❌ Кнопка Google не найдена!');
    console.log('  Попытка найти по SVG...');
    const svgs = document.querySelectorAll('svg');
    svgs.forEach((svg, index) => {
      const parent = svg.closest('button');
      if (parent) {
        console.log(`  Найден button с SVG на индексе ${index}`);
        googleButton = parent;
      }
    });
  }
  
  if (googleButton) {
    console.log('  ✅ Кнопка найдена:', googleButton);
    console.log('  Стили кнопки:', {
      display: window.getComputedStyle(googleButton).display,
      visibility: window.getComputedStyle(googleButton).visibility,
      opacity: window.getComputedStyle(googleButton).opacity,
      pointerEvents: window.getComputedStyle(googleButton).pointerEvents,
      disabled: googleButton.disabled,
      zIndex: window.getComputedStyle(googleButton).zIndex
    });
    
    // Проверяем, не перекрыта ли кнопка
    const rect = googleButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const elementAtPoint = document.elementFromPoint(centerX, centerY);
    console.log('  Элемент в центре кнопки:', elementAtPoint);
    if (elementAtPoint !== googleButton && !googleButton.contains(elementAtPoint)) {
      console.warn('  ⚠️ Кнопка может быть перекрыта элементом:', elementAtPoint);
    }
  } else {
    console.error('  ❌ Кнопка Google не найдена!');
  }
  
  // 2. Проверяем React компоненты
  console.log('\n[2] Проверка React компонентов...');
  const reactFiber = googleButton ? googleButton._reactInternalFiber || googleButton._reactInternalInstance : null;
  if (reactFiber) {
    console.log('  ✅ Найден React Fiber');
    let fiber = reactFiber;
    let depth = 0;
    while (fiber && depth < 10) {
      if (fiber.memoizedProps) {
        console.log(`  Fiber ${depth}:`, {
          type: fiber.type?.name || fiber.type,
          onClick: typeof fiber.memoizedProps?.onClick === 'function' ? '✅ есть' : '❌ нет',
          disabled: fiber.memoizedProps?.disabled
        });
      }
      fiber = fiber.return;
      depth++;
    }
  } else {
    console.log('  ⚠️ React Fiber не найден (может быть в production режиме)');
  }
  
  // 3. Добавляем собственный обработчик клика
  console.log('\n[3] Добавление обработчика клика...');
  if (googleButton) {
    const originalOnClick = googleButton.onclick;
    googleButton.addEventListener('click', function(e) {
      console.log('========================================');
      console.log('🎯 КНОПКА НАЖАТА (через addEventListener)');
      console.log('========================================');
      console.log('Event:', e);
      console.log('Target:', e.target);
      console.log('CurrentTarget:', e.currentTarget);
      console.log('Button:', googleButton);
      console.log('Original onClick:', originalOnClick);
    }, true); // Используем capture phase
    
    // Также пробуем через onclick
    googleButton.onclick = function(e) {
      console.log('========================================');
      console.log('🎯 КНОПКА НАЖАТА (через onclick)');
      console.log('========================================');
      console.log('Event:', e);
      if (originalOnClick) {
        originalOnClick.call(this, e);
      }
    };
    
    console.log('  ✅ Обработчики добавлены');
  }
  
  // 4. Пробуем найти signInWithGoogle через window
  console.log('\n[4] Поиск signInWithGoogle в window...');
  let signInWithGoogle = null;
  for (let key in window) {
    if (key.includes('signIn') || key.includes('Google')) {
      console.log(`  Найдено: ${key}`, typeof window[key]);
    }
  }
  
  // 5. Пробуем найти через React DevTools
  console.log('\n[5] Попытка найти через React DevTools...');
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('  ✅ React DevTools найден');
  } else {
    console.log('  ⚠️ React DevTools не найден');
  }
  
  // 6. Создаем тестовую функцию для проверки
  console.log('\n[6] Создание тестовой функции...');
  window.testGoogleLogin = function() {
    console.log('========================================');
    console.log('🧪 ТЕСТОВЫЙ ВЫЗОВ GOOGLE LOGIN');
    console.log('========================================');
    
    if (!googleButton) {
      console.error('  ❌ Кнопка не найдена!');
      return;
    }
    
    // Проверяем все обработчики событий
    console.log('  Проверка обработчиков событий...');
    const allEventListeners = getEventListeners ? getEventListeners(googleButton) : null;
    if (allEventListeners) {
      console.log('  Обработчики событий:', allEventListeners);
    } else {
      console.log('  ⚠️ getEventListeners недоступен (нужен Chrome DevTools)');
    }
    
    // Проверяем React обработчики через разные способы
    console.log('  Проверка React props...');
    const reactKey = Object.keys(googleButton).find(key => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance'));
    if (reactKey) {
      console.log('  ✅ Найден React ключ:', reactKey);
      const reactInstance = googleButton[reactKey];
      if (reactInstance) {
        console.log('  React instance:', reactInstance);
        let fiber = reactInstance;
        for (let i = 0; i < 5 && fiber; i++) {
          if (fiber.memoizedProps) {
            console.log(`  Fiber ${i} props:`, {
              onClick: typeof fiber.memoizedProps.onClick,
              disabled: fiber.memoizedProps.disabled,
              type: fiber.type?.name || fiber.type
            });
          }
          fiber = fiber.return;
        }
      }
    }
    
    // Пробуем программно кликнуть на кнопку разными способами
    console.log('  Попытка программного клика (способ 1: click())...');
    try {
      googleButton.click();
      console.log('  ✅ click() вызван');
    } catch (e) {
      console.error('  ❌ Ошибка при click():', e);
    }
    
    // Способ 2: через MouseEvent
    setTimeout(() => {
      console.log('  Попытка программного клика (способ 2: MouseEvent)...');
      try {
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        googleButton.dispatchEvent(event);
        console.log('  ✅ MouseEvent отправлен');
      } catch (e) {
        console.error('  ❌ Ошибка при MouseEvent:', e);
      }
    }, 100);
    
    // Способ 3: через PointerEvent
    setTimeout(() => {
      console.log('  Попытка программного клика (способ 3: PointerEvent)...');
      try {
        const event = new PointerEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'mouse'
        });
        googleButton.dispatchEvent(event);
        console.log('  ✅ PointerEvent отправлен');
      } catch (e) {
        console.error('  ❌ Ошибка при PointerEvent:', e);
      }
    }, 200);
  };
  
  console.log('  ✅ Функция window.testGoogleLogin() создана');
  console.log('  Вызовите testGoogleLogin() для теста');
  
  // 7. Мониторинг всех кликов
  console.log('\n[7] Включение мониторинга всех кликов...');
  document.addEventListener('click', function(e) {
    console.log('🖱️ Клик на:', e.target, {
      tagName: e.target.tagName,
      className: e.target.className,
      id: e.target.id,
      text: (e.target.textContent || e.target.innerText || '').substring(0, 50)
    });
    
    if (e.target === googleButton || googleButton?.contains(e.target)) {
      console.log('  ✅ Это клик по кнопке Google!');
    }
  }, true);
  
  console.log('  ✅ Мониторинг кликов включен');
  
  // 8. Проверяем наличие Firebase
  console.log('\n[8] Проверка Firebase...');
  if (window.firebase) {
    console.log('  ✅ Firebase найден:', Object.keys(window.firebase));
  } else {
    console.log('  ⚠️ Firebase не найден в window');
  }
  
  // 9. Сохраняем важные данные перед возможным редиректом
  console.log('\n[9] Сохранение данных для восстановления...');
  window.__GOOGLE_OAUTH_DEBUG__ = {
    googleButton: googleButton,
    testGoogleLogin: window.testGoogleLogin,
    timestamp: Date.now()
  };
  console.log('  ✅ Данные сохранены в window.__GOOGLE_OAUTH_DEBUG__');
  
  // 10. Перехватываем все навигации и редиректы
  console.log('\n[10] Перехват навигаций...');
  
  // Перехватываем window.location изменения
  const originalReplace = window.location.replace;
  const originalAssign = window.location.assign;
  const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
  
  window.location.replace = function(...args) {
    console.log('========================================');
    console.log('🔄 ПЕРЕХВАЧЕН window.location.replace');
    console.log('========================================');
    console.log('URL:', args[0]);
    console.log('Stack trace:', new Error().stack);
    console.log('Сохраняем логи перед редиректом...');
    
    // Сохраняем логи
    const logs = [];
    const originalLog = console.log;
    console.log = function(...args) {
      logs.push(args.join(' '));
      originalLog.apply(console, arguments);
    };
    
    setTimeout(() => {
      localStorage.setItem('googleOAuthDebugLogs', JSON.stringify(logs));
      console.log('  ✅ Логи сохранены в localStorage');
    }, 100);
    
    return originalReplace.apply(this, args);
  };
  
  window.location.assign = function(...args) {
    console.log('========================================');
    console.log('🔄 ПЕРЕХВАЧЕН window.location.assign');
    console.log('========================================');
    console.log('URL:', args[0]);
    return originalAssign.apply(this, args);
  };
  
  // Перехватываем изменения href
  if (originalHref) {
    Object.defineProperty(window.location, 'href', {
      get: originalHref.get,
      set: function(value) {
        console.log('========================================');
        console.log('🔄 ПЕРЕХВАЧЕН window.location.href =');
        console.log('========================================');
        console.log('Новый URL:', value);
        console.log('Текущий URL:', window.location.href);
        if (value.includes('accounts.google.com') || value.includes('google.com/oauth')) {
          console.log('  ✅ Это редирект на Google OAuth!');
        }
        return originalHref.set.call(this, value);
      }
    });
  }
  
  console.log('  ✅ Перехват навигаций настроен');
  
  // 11. Финальная информация
  console.log('\n========================================');
  console.log('✅ ОТЛАДКА НАСТРОЕНА');
  console.log('========================================');
  console.log('Доступные команды:');
  console.log('  - testGoogleLogin() - тестовый вызов');
  console.log('  - window.__GOOGLE_OAUTH_DEBUG__ - доступ к данным');
  console.log('  - Нажмите на кнопку Google и смотрите логи');
  console.log('');
  console.log('⚠️ ВАЖНО: После редиректа скрипт восстановится автоматически');
  console.log('  Проверьте localStorage.getItem("googleOAuthDebugLogs")');
  console.log('========================================\n');
  
  return {
    googleButton,
    testGoogleLogin: window.testGoogleLogin,
    restore: function() {
      console.log('Восстановление данных...');
      if (window.__GOOGLE_OAUTH_DEBUG__) {
        console.log('Данные найдены:', window.__GOOGLE_OAUTH_DEBUG__);
        return window.__GOOGLE_OAUTH_DEBUG__;
      }
    }
  };
})();

// Автовосстановление после загрузки страницы
if (localStorage.getItem('googleOAuthDebugScript')) {
  console.log('🔄 Автовосстановление скрипта...');
  if (window.__GOOGLE_OAUTH_DEBUG__) {
    console.log('✅ Данные найдены:', window.__GOOGLE_OAUTH_DEBUG__);
  }
  
  // Проверяем сохраненные логи
  const savedLogs = localStorage.getItem('googleOAuthDebugLogs');
  if (savedLogs) {
    console.log('📋 Сохраненные логи найдены:');
    try {
      const logs = JSON.parse(savedLogs);
      logs.forEach(log => console.log('  [SAVED]', log));
    } catch (e) {
      console.log('  Логи:', savedLogs);
    }
    localStorage.removeItem('googleOAuthDebugLogs');
  }
  
  // Проверяем URL на наличие OAuth параметров
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  if (urlParams.has('__firebase_request_key') || hash.includes('access_token') || hash.includes('id_token')) {
    console.log('========================================');
    console.log('🔍 ОБНАРУЖЕНЫ OAuth ПАРАМЕТРЫ В URL!');
    console.log('========================================');
    console.log('Search:', window.location.search);
    console.log('Hash:', hash.substring(0, 200));
    console.log('Full URL:', window.location.href);
  }
}

