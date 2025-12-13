// Скрипт для добавления начальных проектов в Firestore
// Запуск: node scripts/seed-projects.js

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const projects = [
  {
    title: 'KimeCosmicMall',
    description: 'Интернет-магазин модной женской одежды. Полнофункциональный веб-сайт с каталогом товаров, корзиной и системой заказов.',
    author: 'syyimyk',
    type: 'web',
    technologies: ['Next.js', 'React', 'TypeScript', 'Firebase'],
    year: 2024,
    demo: 'https://kimecosmicmall.vercel.app',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'GameGift.live',
    description: 'Приложение для записи к стоматологу. Включает веб-сайт и Android приложение для удобной записи на прием к стоматологу.',
    author: 'syyimyk',
    type: 'web',
    technologies: ['Next.js', 'React', 'Android', 'Kotlin'],
    year: 2024,
    demo: 'https://gamegift.live',
    download: 'https://gamegift.live/app.apk',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Dreamon - AI Примерочная',
    description: 'Современное мобильное приложение для покупки одежды с AI примерочной. Включает каталог товаров, историю образов и чат с поддержкой.',
    author: 'syyimyk',
    type: 'web',
    technologies: ['Next.js', 'React', 'AI', 'Machine Learning'],
    year: 2024,
    demo: 'https://website-theta-one-41.vercel.app',
    note: 'В разработке',
    createdAt: new Date().toISOString(),
  },
];

async function seedProjects() {
  try {
    for (const project of projects) {
      await db.collection('projects').add(project);
      console.log(`Added project: ${project.title}`);
    }
    console.log('All projects added successfully!');
  } catch (error) {
    console.error('Error seeding projects:', error);
  }
}

seedProjects();





// Запуск: node scripts/seed-projects.js

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const projects = [
  {
    title: 'KimeCosmicMall',
    description: 'Интернет-магазин модной женской одежды. Полнофункциональный веб-сайт с каталогом товаров, корзиной и системой заказов.',
    author: 'syyimyk',
    type: 'web',
    technologies: ['Next.js', 'React', 'TypeScript', 'Firebase'],
    year: 2024,
    demo: 'https://kimecosmicmall.vercel.app',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'GameGift.live',
    description: 'Приложение для записи к стоматологу. Включает веб-сайт и Android приложение для удобной записи на прием к стоматологу.',
    author: 'syyimyk',
    type: 'web',
    technologies: ['Next.js', 'React', 'Android', 'Kotlin'],
    year: 2024,
    demo: 'https://gamegift.live',
    download: 'https://gamegift.live/app.apk',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Dreamon - AI Примерочная',
    description: 'Современное мобильное приложение для покупки одежды с AI примерочной. Включает каталог товаров, историю образов и чат с поддержкой.',
    author: 'syyimyk',
    type: 'web',
    technologies: ['Next.js', 'React', 'AI', 'Machine Learning'],
    year: 2024,
    demo: 'https://website-theta-one-41.vercel.app',
    note: 'В разработке',
    createdAt: new Date().toISOString(),
  },
];

async function seedProjects() {
  try {
    for (const project of projects) {
      await db.collection('projects').add(project);
      console.log(`Added project: ${project.title}`);
    }
    console.log('All projects added successfully!');
  } catch (error) {
    console.error('Error seeding projects:', error);
  }
}

seedProjects();












