/**
 * Простой скрипт экспорта через Firebase CLI (если доступен gcloud)
 * Или использует прямой доступ через REST API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Используем REST API Firebase для экспорта
// Для этого нужен API ключ или токен доступа

const PROJECT_ID = 'freedip-27d92';
const collections = [
  'users',
  'subscriptions',
  'chat_messages',
  'global_chat',
  'profile_likes',
  'course_progress',
  'blog_posts',
  'projects',
  'reviews',
  'chat_history'
];

console.log('📝 Для экспорта данных из Firestore используйте один из методов:');
console.log('');
console.log('Метод 1: Через Firebase Console');
console.log('  1. Откройте https://console.firebase.google.com/project/freedip-27d92/firestore');
console.log('  2. Перейдите в настройки проекта');
console.log('  3. Используйте функцию экспорта данных');
console.log('');
console.log('Метод 2: Через gcloud CLI (если установлен)');
console.log('  gcloud firestore export gs://freedip-27d92.appspot.com/backup');
console.log('');
console.log('Метод 3: Создать serviceAccountKey.json и использовать scripts/export-firestore-data.js');
console.log('  1. Firebase Console > Project Settings > Service Accounts');
console.log('  2. Generate New Private Key');
console.log('  3. Сохранить как serviceAccountKey.json в корне проекта');
console.log('');
console.log('После экспорта запустите: node scripts/migrate-firestore-to-postgres.js');





