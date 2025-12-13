/**
 * Скрипт для миграции данных из Firebase Firestore в PostgreSQL
 * Использует экспортированные данные из Firebase
 */

const fs = require('fs');
const path = require('path');

// Путь к экспортированным данным
const exportPath = path.join(__dirname, '../firestore_export');

// Коллекции для миграции
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

function parseFirestoreExport() {
  console.log('📦 Парсинг экспортированных данных из Firestore...');
  
  if (!fs.existsSync(exportPath)) {
    console.error('❌ Директория экспорта не найдена:', exportPath);
    console.log('💡 Сначала выполните: firebase firestore:export firestore_export');
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
      } else if (file.endsWith('.json')) {
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
      
      // Определяем коллекцию по пути
      const relativePath = path.relative(exportPath, filePath);
      const parts = relativePath.split(path.sep);
      
      if (parts.length >= 2) {
        const collectionName = parts[0];
        if (collections.includes(collectionName)) {
          if (!data[collectionName]) {
            data[collectionName] = [];
          }
          
          // Обрабатываем структуру Firestore экспорта
          if (jsonData.documents) {
            jsonData.documents.forEach(doc => {
              const docId = doc.name.split('/').pop();
              const fields = doc.fields || {};
              
              // Конвертируем Firestore типы в обычные значения
              const converted = convertFirestoreFields(fields);
              converted.id = docId;
              converted.createdAt = doc.createTime || new Date().toISOString();
              converted.updatedAt = doc.updateTime || new Date().toISOString();
              
              data[collectionName].push(converted);
            });
          }
        }
      }
    } catch (error) {
      console.error(`⚠️ Ошибка при парсинге ${filePath}:`, error.message);
    }
  });

  return data;
}

function convertFirestoreFields(fields) {
  const result = {};
  
  for (const [key, value] of Object.entries(fields)) {
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
    }
  }
  
  return result;
}

function generatePostgresSQL(data) {
  console.log('📝 Генерация SQL для PostgreSQL...');
  
  const sql = [];
  
  // Миграция users
  if (data.users && data.users.length > 0) {
    sql.push('-- Миграция пользователей');
    sql.push('INSERT INTO "Users" (id, email, nickname, "displayName", role, avatar, bio, achievements, privacy, stats, "createdAt", "updatedAt") VALUES');
    
    const values = data.users.map(user => {
      const achievements = Array.isArray(user.achievements) ? JSON.stringify(user.achievements) : '[]';
      const privacy = user.privacy ? JSON.stringify(user.privacy) : '{"showActivity":true,"showAchievements":true,"showProfile":true}';
      const stats = user.stats ? JSON.stringify(user.stats) : '{"projectsViewed":0,"blogPostsRead":0,"codeRuns":0,"messagesSent":0,"loginCount":0}';
      
      return `('${user.id}', '${user.email || ''}', '${(user.nickname || '').replace(/'/g, "''")}', '${(user.displayName || user.nickname || '').replace(/'/g, "''")}', '${user.role || 'user'}', ${user.avatar ? `'${user.avatar.replace(/'/g, "''")}'` : 'NULL'}, ${user.bio ? `'${user.bio.replace(/'/g, "''")}'` : 'NULL'}, '${achievements}', '${privacy}', '${stats}', '${user.createdAt || new Date().toISOString()}', '${user.updatedAt || new Date().toISOString()}')`;
    });
    
    sql.push(values.join(',\n') + ' ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, nickname = EXCLUDED.nickname, "displayName" = EXCLUDED."displayName", role = EXCLUDED.role, avatar = EXCLUDED.avatar, bio = EXCLUDED.bio, achievements = EXCLUDED.achievements, privacy = EXCLUDED.privacy, stats = EXCLUDED.stats, "updatedAt" = EXCLUDED."updatedAt";');
    sql.push('');
  }

  // Миграция subscriptions
  if (data.subscriptions && data.subscriptions.length > 0) {
    sql.push('-- Миграция подписок');
    sql.push('INSERT INTO "Subscriptions" (user_id, following, followers, "createdAt", "updatedAt") VALUES');
    
    const values = data.subscriptions.map(sub => {
      const following = Array.isArray(sub.following) ? JSON.stringify(sub.following) : '[]';
      const followers = Array.isArray(sub.followers) ? JSON.stringify(sub.followers) : '[]';
      
      return `('${sub.id}', '${following}', '${followers}', '${sub.createdAt || new Date().toISOString()}', '${sub.updatedAt || new Date().toISOString()}')`;
    });
    
    sql.push(values.join(',\n') + ' ON CONFLICT (user_id) DO UPDATE SET following = EXCLUDED.following, followers = EXCLUDED.followers, "updatedAt" = EXCLUDED."updatedAt";');
    sql.push('');
  }

  // Миграция сообщений
  if (data.chat_messages && data.chat_messages.length > 0) {
    sql.push('-- Миграция приватных сообщений');
    sql.push('INSERT INTO "Messages" (id, sender_id, receiver_id, content, "imageUrl", read, "createdAt") VALUES');
    
    const values = data.chat_messages.map(msg => {
      return `('${msg.id}', '${msg.senderId || msg.userId}', '${msg.receiverId}', '${(msg.content || msg.text || '').replace(/'/g, "''")}', ${msg.imageUrl ? `'${msg.imageUrl.replace(/'/g, "''")}'` : 'NULL'}, ${msg.read ? 'true' : 'false'}, '${msg.timestamp || msg.createdAt || new Date().toISOString()}')`;
    });
    
    sql.push(values.join(',\n') + ' ON CONFLICT (id) DO NOTHING;');
    sql.push('');
  }

  if (data.global_chat && data.global_chat.length > 0) {
    sql.push('-- Миграция глобального чата');
    sql.push('INSERT INTO "GlobalMessages" (id, user_id, content, "imageUrl", "createdAt") VALUES');
    
    const values = data.global_chat.map(msg => {
      return `('${msg.id}', '${msg.userId || msg.senderId}', '${(msg.content || msg.text || '').replace(/'/g, "''")}', ${msg.imageUrl ? `'${msg.imageUrl.replace(/'/g, "''")}'` : 'NULL'}, '${msg.timestamp || msg.createdAt || new Date().toISOString()}')`;
    });
    
    sql.push(values.join(',\n') + ' ON CONFLICT (id) DO NOTHING;');
    sql.push('');
  }

  // Миграция лайков профилей
  if (data.profile_likes && data.profile_likes.length > 0) {
    sql.push('-- Миграция лайков профилей');
    sql.push('INSERT INTO "ProfileLikes" (user_id, liked_by, count, "createdAt", "updatedAt") VALUES');
    
    const values = data.profile_likes.map(like => {
      const likedBy = Array.isArray(like.likedBy) ? JSON.stringify(like.likedBy) : '[]';
      return `('${like.id}', '${likedBy}', ${like.count || 0}, '${like.createdAt || new Date().toISOString()}', '${like.updatedAt || new Date().toISOString()}')`;
    });
    
    sql.push(values.join(',\n') + ' ON CONFLICT (user_id) DO UPDATE SET liked_by = EXCLUDED.liked_by, count = EXCLUDED.count, "updatedAt" = EXCLUDED."updatedAt";');
    sql.push('');
  }

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
  console.log(`   psql -h localhost -U postgres -d freedip -f migration.sql`);
}

if (require.main === module) {
  main();
}

module.exports = { parseFirestoreExport, generatePostgresSQL };





