// ========================================
// BOOKMARKLET - СОЗДАЙТЕ ЗАКЛАДКУ С ЭТИМ КОДОМ
// ========================================
// Инструкция:
// 1. Скопируйте весь код ниже (начиная с javascript:)
// 2. Создайте новую закладку в браузере
// 3. Вставьте код в URL закладки
// 4. Нажмите на закладку на странице логина - скрипт запустится
// ========================================

javascript:(function(){const b=Array.from(document.querySelectorAll('button')).find(btn=>{const t=btn.textContent||btn.innerText||'';return t.includes('Google')||t.includes('Войти через Google')});if(!b){console.error('❌ Кнопка не найдена');return;}console.log('✅ Кнопка найдена:',b);b.addEventListener('click',function(e){console.log('🎯 КНОПКА НАЖАТА!',e);sessionStorage.setItem('googleClick',Date.now().toString());},true);const orig=window.location.replace;window.location.replace=function(url){console.log('🔄 РЕДИРЕКТ:',url);if(url.includes('google.com')){sessionStorage.setItem('googleRedirect',url);}return orig.call(this,url);};const p=new URLSearchParams(window.location.search);const h=window.location.hash;if(p.has('__firebase_request_key')||h.includes('access_token')||h.includes('id_token')){console.log('🔍 OAuth параметры:',window.location.search,h.substring(0,100));}console.log('✅ Отладка настроена!');})();







