/**
 * Улучшенный скрипт для миграции данных из Firebase Firestore в PostgreSQL
 * Адаптирован под структуру базы данных на VPS
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Путь к экспортированным данным
const exportPath = path.join(__dirname, '../firestore_export');

// Маппинг Firebase UID -> UUID
const uidToUuidMap = new Map();

function generateUuidForUid(uid) {
  if (!uidToUuidMap.has(uid)) {
    uidToUuidMap.set(uid, uuidv4());
  }
  return uidToUuidMap.get(uid);
}

function parseFirestoreExport() {
  console.log('📦 Парсинг экспортированных данных из Firestore...');
  
  if (!fs.existsSync(exportPath)) {
    console.error('❌ Директория экспорта не найдена:', exportPath);
    console.log('💡 Сначала выполните экспорт данных из Firebase');
    process.exit(1);
  }

  const data = {};
  
  // Ищем все JSON файлы в экспорте
  function findJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findJsonFiles(filePath, fileList);
      } else if (file.endsWith('.json') && file !== 'summary.json') {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  const jsonFiles = findJsonFiles(exportPath);
  console.log(`📄 Найдено ${jsonFiles.length} JSON файлов`);

  // Парсим каждый файл
  jsonFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(content);
      
      // Определяем коллекцию по имени файла
      const fileName = path.basename(filePath, '.json');
      
      if (!data[fileName]) {
        data[fileName] = [];
      }
      
      // Если это массив документов
      if (Array.isArray(jsonData)) {
        jsonData.forEach(doc => {
          data[fileName].push(doc);
        });
      } else if (jsonData.documents) {
        // Формат экспорта Firebase
        jsonData.documents.forEach(doc => {
          const docId = doc.name ? doc.name.split('/').pop() : doc.id;
          const fields = doc.fields || doc;
          
          const converted = convertFirestoreFields(fields);
          converted.id = docId;
          converted.createdAt = doc.createTime || doc.createdAt || new Date().toISOString();
          converted.updatedAt = doc.updateTime || doc.updatedAt || new Date().toISOString();
          
          data[fileName].push(converted);
        });
      } else {
        // Одиночный документ
        data[fileName].push(jsonData);
      }
    } catch (error) {
      console.error(`⚠️ Ошибка при парсинге ${filePath}:`, error.message);
    }
  });

  return data;
}

function convertFirestoreFields(fields) {
  if (!fields || typeof fields !== 'object') {
    return fields;
  }
  
  const result = {};
  
  for (const [key, value] of Object.entries(fields)) {
    // Если это уже обычное значение
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      result[key] = value;
      continue;
    }
    
    // Обработка Firestore типов
    if (value.stringValue !== undefined) {
      result[key] = value.stringValue;
    } else if (value.integerValue !== undefined) {
      result[key] = parseInt(value.integerValue);
    } else if (value.doubleValue !== undefined) {
      result[key] = parseFloat(value.doubleValue);
    } else if (value.booleanValue !== undefined) {
      result[key] = value.booleanValue;
    } else if (value.timestampValue !== undefined) {
      result[key] = value.timestampValue;
    } else if (value.arrayValue) {
      result[key] = value.arrayValue.values.map(v => {
        if (v.stringValue !== undefined) return v.stringValue;
        if (v.integerValue !== undefined) return parseInt(v.integerValue);
        if (v.doubleValue !== undefined) return parseFloat(v.doubleValue);
        if (v.booleanValue !== undefined) return v.booleanValue;
        if (v.mapValue) return convertFirestoreFields(v.mapValue.fields);
        return null;
      });
    } else if (value.mapValue) {
      result[key] = convertFirestoreFields(value.mapValue.fields);
    } else if (value.nullValue !== undefined) {
      result[key] = null;
    } else {
      // Если это обычный объект, рекурсивно обрабатываем
      result[key] = convertFirestoreFields(value);
    }
  }
  
  return result;
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function generatePostgresSQL(data) {
  console.log('📝 Генерация SQL для PostgreSQL...');
  
  const sql = [];
  
  // Создаем маппинг UID -> UUID для всех пользователей
  if (data.users && data.users.length > 0) {
    console.log('  🔄 Создание маппинга Firebase UID -> UUID...');
    data.users.forEach(user => {
      generateUuidForUid(user.id || user.uid);
    });
  }
  
  // Миграция users
  if (data.users && data.users.length > 0) {
    sql.push('-- Миграция пользователей');
    sql.push('-- Создаем временную таблицу для маппинга UID');
    sql.push('CREATE TABLE IF NOT EXISTS uid_mapping (firebase_uid TEXT PRIMARY KEY, uuid UUID);');
    sql.push('');
    
    sql.push('INSERT INTO uid_mapping (firebase_uid, uuid) VALUES');
    const mappingValues = data.users.map(user => {
      const uid = user.id || user.uid;
      const uuid = generateUuidForUid(uid);
      return `('${uid}', '${uuid}')`;
    });
    sql.push(mappingValues.join(',\n') + ' ON CONFLICT (firebase_uid) DO NOTHING;');
    sql.push('');
    
    sql.push('INSERT INTO "Users" (id, email, username, "displayName", role, "avatarUrl", "createdAt", "updatedAt", "isEmailVerified", provider) VALUES');
    
    const values = data.users.map(user => {
      const uid = user.id || user.uid;
      const uuid = generateUuidForUid(uid);
      const email = user.email || '';
      const username = user.nickname || user.username || email.split('@')[0] || 'user';
      const displayName = user.displayName || user.nickname || username;
      const role = user.role === 'admin' ? 'Admin' : 'User';
      const avatarUrl = user.avatar || user.photoURL || null;
      const createdAt = user.createdAt || new Date().toISOString();
      const updatedAt = user.updatedAt || new Date().toISOString();
      const provider = user.provider || (user.googleId ? 'google' : 'email');
      
      return `('${uuid}', ${escapeSql(email)}, ${escapeSql(username)}, ${escapeSql(displayName)}, ${escapeSql(role)}, ${avatarUrl ? escapeSql(avatarUrl) : 'NULL'}, '${createdAt}', '${updatedAt}', ${user.emailVerified || false}, ${escapeSql(provider)})`;
    });
    
    sql.push(values.join(',\n') + ' ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username, "displayName" = EXCLUDED."displayName", role = EXCLUDED.role, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = EXCLUDED."updatedAt";');
    sql.push('');
  }

  // Миграция подписок (если таблица существует)
  if (data.subscriptions && data.subscriptions.length > 0) {
    sql.push('-- Миграция подписок');
    sql.push('-- Примечание: Нужно создать таблицу Subscriptions если её нет');
    sql.push('-- CREATE TABLE IF NOT EXISTS "Subscriptions" (id UUID PRIMARY KEY, follower_id UUID, following_id UUID, "createdAt" TIMESTAMP);');
    sql.push('');
    
    // TODO: Адаптировать под структуру таблицы Subscriptions
  }

  // Миграция сообщений
  if (data.chat_messages && data.chat_messages.length > 0) {
    sql.push('-- Миграция приватных сообщений');
    sql.push('-- Примечание: Нужно создать таблицу Messages если её нет');
    sql.push('-- Структура: id UUID, sender_id UUID, receiver_id UUID, encrypted_content TEXT, created_at TIMESTAMP');
    sql.push('');
  }

  if (data.global_chat && data.global_chat.length > 0) {
    sql.push('-- Миграция глобального чата');
    sql.push('-- Примечание: Глобальный чат может храниться в таблице Messages с receiver_id = NULL');
    sql.push('');
  }

  // Сохраняем маппинг для использования в других скриптах
  const mappingData = Array.from(uidToUuidMap.entries()).map(([uid, uuid]) => ({ uid, uuid }));
  fs.writeFileSync(
    path.join(__dirname, '../uid_mapping.json'),
    JSON.stringify(mappingData, null, 2),
    'utf8'
  );
  console.log('  💾 Маппинг сохранен в uid_mapping.json');
  
  return sql.join('\n');
}

// Главная функция
function main() {
  console.log('🚀 Начало миграции данных из Firebase Firestore в PostgreSQL\n');
  
  const data = parseFirestoreExport();
  
  console.log('\n📊 Найденные коллекции:');
  Object.keys(data).forEach(collection => {
    console.log(`  - ${collection}: ${data[collection].length} документов`);
  });
  
  const sql = generatePostgresSQL(data);
  
  const outputPath = path.join(__dirname, '../migration.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');
  
  console.log(`\n✅ SQL файл создан: ${outputPath}`);
  console.log(`\n💡 Для применения миграции выполните на VPS:`);
  console.log(`   scp migration.sql root@213.199.56.27:/tmp/`);
  console.log(`   ssh root@213.199.56.27 "docker exec -i freedip-postgres psql -U postgres -d freedip < /tmp/migration.sql"`);
  console.log(`\n⚠️  ВАЖНО: Проверьте структуру таблиц на VPS перед импортом!`);
}

if (require.main === module) {
  main();
}

module.exports = { parseFirestoreExport, generatePostgresSQL };





