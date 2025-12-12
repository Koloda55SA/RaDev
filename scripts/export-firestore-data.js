/**
 * Скрипт для экспорта данных из Firebase Firestore
 * Использует Firebase Admin SDK
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Инициализация Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'freedip-27d92'
});

const db = admin.firestore();

// Коллекции для экспорта
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

async function exportCollection(collectionName) {
  console.log(`📦 Экспорт коллекции: ${collectionName}...`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = [];
    
    snapshot.forEach(doc => {
      const docData = doc.data();
      docData.id = doc.id;
      data.push(docData);
    });
    
    const outputDir = path.join(__dirname, '../firestore_export');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `${collectionName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`  ✅ Экспортировано ${data.length} документов в ${outputPath}`);
    return data;
  } catch (error) {
    console.error(`  ❌ Ошибка при экспорте ${collectionName}:`, error.message);
    return [];
  }
}

async function exportAll() {
  console.log('🚀 Начало экспорта данных из Firestore...\n');
  
  const allData = {};
  
  for (const collectionName of collections) {
    const data = await exportCollection(collectionName);
    allData[collectionName] = data;
  }
  
  // Сохраняем сводку
  const summary = {
    exportedAt: new Date().toISOString(),
    collections: {}
  };
  
  Object.keys(allData).forEach(collection => {
    summary.collections[collection] = allData[collection].length;
  });
  
  const summaryPath = path.join(__dirname, '../firestore_export/summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  
  console.log('\n📊 Сводка экспорта:');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\n✅ Экспорт завершен! Данные сохранены в: ${path.join(__dirname, '../firestore_export')}`);
  
  process.exit(0);
}

exportAll().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});




