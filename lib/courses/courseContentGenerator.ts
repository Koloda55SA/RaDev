// Генератор полноценного контента для курсов
// Создает уникальный контент для каждого языка с прогрессирующей сложностью

import { Lesson, Chapter, Course, Language } from './courseData'

// Темы для Python (100 глав)
const PYTHON_TOPICS = [
  // Основы (1-20)
  'Введение в Python', 'Переменные и типы данных', 'Операторы и выражения', 'Ввод и вывод данных',
  'Условные операторы', 'Циклы for', 'Циклы while', 'Строки и методы строк',
  'Списки', 'Кортежи', 'Словари', 'Множества', 'Функции', 'Параметры функций',
  'Возврат значений', 'Локальные и глобальные переменные', 'Лямбда-функции', 'Рекурсия',
  'Модули и импорт', 'Работа с файлами',
  
  // Структуры данных (21-40)
  'Обработка списков', 'Списковые включения', 'Генераторы', 'Итераторы',
  'Сортировка данных', 'Поиск в данных', 'Фильтрация данных', 'Группировка данных',
  'Стеки и очереди', 'Деревья', 'Графы', 'Хеш-таблицы', 'JSON', 'CSV',
  'XML', 'Регулярные выражения', 'Обработка текста', 'Кодировки',
  'Сериализация', 'Десериализация',
  
  // ООП (41-60)
  'Классы и объекты', 'Конструкторы', 'Атрибуты класса', 'Методы класса',
  'Наследование', 'Множественное наследование', 'Полиморфизм', 'Инкапсуляция',
  'Свойства', 'Декораторы классов', 'Магические методы', 'Абстрактные классы',
  'Интерфейсы', 'Миксины', 'Композиция', 'Агрегация',
  'Перегрузка операторов', 'Исключения', 'Обработка ошибок', 'Логирование',
  
  // Продвинутые темы (61-80)
  'Декораторы', 'Генераторы', 'Контекстные менеджеры', 'Метапрограммирование',
  'Дескрипторы', 'Метаклассы', 'Аннотации типов', 'Type hints',
  'Асинхронное программирование', 'async/await', 'asyncio', 'Многопоточность',
  'Многопроцессорность', 'Параллелизм', 'Синхронизация', 'Очереди',
  'Сокеты', 'HTTP клиенты', 'HTTP серверы', 'REST API',
  
  // Специализация (81-100)
  'Веб-разработка Flask', 'Веб-разработка Django', 'Базы данных SQLite', 'Базы данных PostgreSQL',
  'ORM SQLAlchemy', 'Тестирование unittest', 'Тестирование pytest', 'Data Science pandas',
  'Data Science numpy', 'Машинное обучение', 'Визуализация данных', 'Анализ данных',
  'Автоматизация задач', 'Парсинг веб-страниц', 'Работа с API', 'Микросервисы',
  'Docker', 'CI/CD', 'Оптимизация производительности', 'Профилирование кода'
]

// Темы для JavaScript (100 глав)
const JAVASCRIPT_TOPICS = [
  // Основы (1-20)
  'Введение в JavaScript', 'Переменные let, const, var', 'Типы данных', 'Операторы',
  'Условные операторы', 'Циклы', 'Функции', 'Стрелочные функции',
  'Массивы', 'Методы массивов', 'Объекты', 'Деструктуризация',
  'Spread и Rest', 'Шаблонные строки', 'Оператор опциональной цепочки', 'Nullish coalescing',
  'Модули ES6', 'Импорт и экспорт', 'Строки и методы', 'Числа и методы',
  
  // DOM и события (21-40)
  'DOM дерево', 'Выбор элементов', 'Изменение DOM', 'Создание элементов',
  'Удаление элементов', 'События', 'Обработчики событий', 'Делегирование событий',
  'Формы', 'Валидация форм', 'LocalStorage', 'SessionStorage',
  'Cookies', 'Работа с классами', 'Анимации', 'Таймеры',
  'Интервалы', 'RequestAnimationFrame', 'Геолокация', 'Медиа API',
  
  // Асинхронность (41-60)
  'Асинхронность', 'Callbacks', 'Промисы', 'Promise.all',
  'Promise.race', 'async/await', 'Обработка ошибок', 'Fetch API',
  'Axios', 'WebSockets', 'Server-Sent Events', 'Web Workers',
  'Service Workers', 'IndexedDB', 'File API', 'Blob API',
  'Streams', 'Generators', 'Iterators', 'Symbols',
  
  // Продвинутые темы (61-80)
  'Замыкания', 'Контекст this', 'bind, call, apply', 'Прототипы',
  'Наследование', 'Классы ES6', 'Статические методы', 'Геттеры и сеттеры',
  'Приватные поля', 'Модули', 'Tree shaking', 'Bundlers',
  'Webpack', 'Vite', 'TypeScript основы', 'Типы в TypeScript',
  'Интерфейсы', 'Дженерики', 'Утилиты типов', 'Декораторы',
  
  // Фреймворки и библиотеки (81-100)
  'React основы', 'Компоненты', 'Хуки', 'Состояние',
  'Props', 'Context API', 'Роутинг', 'React Router',
  'Vue.js основы', 'Vue компоненты', 'Vuex', 'Angular основы',
  'Node.js', 'Express', 'REST API', 'GraphQL',
  'Тестирование Jest', 'E2E тестирование', 'Оптимизация', 'Производительность'
]

// Темы для Java (100 глав)
const JAVA_TOPICS = [
  // Основы (1-20)
  'Введение в Java', 'Установка JDK', 'Первая программа', 'Переменные',
  'Типы данных', 'Операторы', 'Условные операторы', 'Циклы',
  'Массивы', 'Многомерные массивы', 'Строки', 'StringBuilder',
  'Методы', 'Параметры методов', 'Перегрузка методов', 'Рекурсия',
  'Классы', 'Объекты', 'Конструкторы', 'Модификаторы доступа',
  
  // ООП (21-40)
  'Наследование', 'Переопределение методов', 'super', 'Абстрактные классы',
  'Интерфейсы', 'Множественное наследование', 'Полиморфизм', 'Инкапсуляция',
  'Статические методы', 'Статические переменные', 'Финальные классы', 'Финальные методы',
  'Внутренние классы', 'Анонимные классы', 'Лямбда-выражения', 'Ссылки на методы',
  'Перечисления', 'Аннотации', 'Рефлексия', 'Генерация кода',
  
  // Коллекции (41-60)
  'ArrayList', 'LinkedList', 'HashSet', 'TreeSet',
  'HashMap', 'TreeMap', 'Queue', 'Stack',
  'Итераторы', 'Comparable', 'Comparator', 'Сортировка',
  'Поиск в коллекциях', 'Фильтрация', 'Stream API', 'Optional',
  'Ленивые вычисления', 'Параллельные потоки', 'Коллекции потоков', 'Группировка',
  
  // Исключения и ввод-вывод (61-80)
  'Исключения', 'try-catch', 'finally', 'Пользовательские исключения',
  'Чтение файлов', 'Запись файлов', 'BufferedReader', 'BufferedWriter',
  'Сериализация', 'Десериализация', 'JSON', 'XML',
  'Сокеты', 'Сетевые соединения', 'HTTP клиенты', 'Многопоточность',
  'Thread', 'Runnable', 'Синхронизация', 'Concurrent коллекции',
  
  // Продвинутые темы (81-100)
  'Spring Framework', 'Dependency Injection', 'Spring Boot', 'REST контроллеры',
  'JPA', 'Hibernate', 'Базы данных', 'JDBC',
  'Тестирование JUnit', 'Mockito', 'Maven', 'Gradle',
  'Логирование', 'Конфигурация', 'Микросервисы', 'Docker',
  'Kubernetes', 'Оптимизация', 'Профилирование', 'Best practices'
]

// Темы для C++ (100 глав)
const CPP_TOPICS = [
  // Основы (1-20)
  'Введение в C++', 'Компиляция', 'Первая программа', 'Переменные',
  'Типы данных', 'Операторы', 'Условные операторы', 'Циклы',
  'Массивы', 'Многомерные массивы', 'Строки', 'string класс',
  'Функции', 'Параметры функций', 'Перегрузка функций', 'Рекурсия',
  'Указатели', 'Ссылки', 'Динамическая память', 'new и delete',
  
  // Указатели и память (21-40)
  'Указатели на указатели', 'Указатели на функции', 'Массивы и указатели', 'Строки и указатели',
  'Динамические массивы', 'Умные указатели', 'unique_ptr', 'shared_ptr',
  'weak_ptr', 'Утечки памяти', 'Валидация указателей', 'RAII',
  'Исключения', 'try-catch', 'Пользовательские исключения', 'Обработка ошибок',
  'Логирование', 'Отладка', 'Профилирование', 'Оптимизация памяти',
  
  // ООП (41-60)
  'Классы', 'Объекты', 'Конструкторы', 'Деструкторы',
  'Копирующий конструктор', 'Оператор присваивания', 'Наследование', 'Множественное наследование',
  'Виртуальные функции', 'Абстрактные классы', 'Интерфейсы', 'Полиморфизм',
  'Инкапсуляция', 'Модификаторы доступа', 'Дружественные функции', 'Статические члены',
  'Перегрузка операторов', 'Шаблоны', 'Шаблоны классов', 'Специализация шаблонов',
  
  // STL (61-80)
  'STL контейнеры', 'vector', 'list', 'deque',
  'set', 'map', 'unordered_set', 'unordered_map',
  'Итераторы', 'Алгоритмы', 'sort', 'find',
  'transform', 'accumulate', 'Лямбда-функции', 'Функциональные объекты',
  'Адаптеры', 'stack', 'queue', 'priority_queue',
  
  // Продвинутые темы (81-100)
  'Многопоточность', 'thread', 'mutex', 'condition_variable',
  'future', 'promise', 'async', 'Параллельные алгоритмы',
  'Сокеты', 'Сетевые соединения', 'HTTP клиенты', 'JSON',
  'XML', 'Регулярные выражения', 'Файловый ввод-вывод', 'Библиотеки',
  'CMake', 'Тестирование', 'Оптимизация', 'Best practices'
]

// Темы для C# (100 глав)
const CSHARP_TOPICS = [
  // Основы (1-20)
  'Введение в C#', 'Установка .NET', 'Первая программа', 'Переменные',
  'Типы данных', 'Операторы', 'Условные операторы', 'Циклы',
  'Массивы', 'Многомерные массивы', 'Строки', 'StringBuilder',
  'Методы', 'Параметры методов', 'Перегрузка методов', 'Рекурсия',
  'Классы', 'Объекты', 'Конструкторы', 'Модификаторы доступа',
  
  // ООП (21-40)
  'Наследование', 'Переопределение методов', 'base', 'Абстрактные классы',
  'Интерфейсы', 'Множественные интерфейсы', 'Полиморфизм', 'Инкапсуляция',
  'Статические члены', 'Свойства', 'Индексаторы', 'События',
  'Делегаты', 'Лямбда-выражения', 'Анонимные методы', 'Перечисления',
  'Структуры', 'Кортежи', 'Атрибуты', 'Рефлексия',
  
  // Коллекции и LINQ (41-60)
  'List', 'Dictionary', 'HashSet', 'Queue',
  'Stack', 'Итераторы', 'yield return', 'LINQ',
  'Методы расширения', 'Анонимные типы', 'Группировка', 'Сортировка',
  'Фильтрация', 'Проекции', 'Агрегация', 'Join',
  'Группировка', 'Сортировка', 'Параллельный LINQ', 'Ленивые вычисления',
  
  // Асинхронность и многопоточность (61-80)
  'Асинхронность', 'async/await', 'Task', 'Task<T>',
  'Параллельные задачи', 'CancellationToken', 'Потоки', 'Thread',
  'Синхронизация', 'lock', 'Monitor', 'Semaphore',
  'Concurrent коллекции', 'Параллельные циклы', 'PLINQ', 'Обработка ошибок',
  'Исключения', 'try-catch-finally', 'Пользовательские исключения', 'Логирование',
  
  // Веб и базы данных (81-100)
  'ASP.NET Core', 'MVC', 'REST API', 'Entity Framework',
  'LINQ to SQL', 'Базы данных', 'ADO.NET', 'Миграции',
  'Dependency Injection', 'Middleware', 'Роутинг', 'Авторизация',
  'Аутентификация', 'JWT', 'Тестирование', 'xUnit',
  'Mocking', 'Docker', 'CI/CD', 'Оптимизация'
]

// Генерация уникального контента для урока
export function generateLessonContent(
  language: Language,
  chapterIndex: number,
  lessonIndex: number,
  topic: string,
  difficulty: number
): Lesson {
  const langNames: Partial<Record<Language, string>> = {
    python: 'Python',
    javascript: 'JavaScript',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    html: 'HTML',
    css: 'CSS'
  }
  
  const langName = langNames[language] || language
  const lessonId = `${language}-${chapterIndex + 1}-lesson-${lessonIndex + 1}`
  
  // Генерация теории на основе темы и сложности
  const theory = generateTheory(language, topic, difficulty, chapterIndex, lessonIndex)
  
  // Генерация практического задания
  const practice = generatePractice(language, topic, difficulty, chapterIndex, lessonIndex)
  
  return {
    id: lessonId,
    title: `${topic} - Часть ${lessonIndex + 1}`,
    content: theory,
    practice: {
      starterCode: practice.starterCode || '',
      solution: (practice as any).solution || ''
    }
  }
}

// Генерация теории с детальными объяснениями
function generateTheory(
  language: Language,
  topic: string,
  difficulty: number,
  chapterIndex: number,
  lessonIndex: number
): string {
  const langNames: Partial<Record<Language, string>> = {
    python: 'Python',
    javascript: 'JavaScript',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    html: 'HTML',
    css: 'CSS'
  }
  
  const langName = langNames[language] || language
  
  // Создаем уникальный seed для каждого урока
  const seed = chapterIndex * 1000 + lessonIndex * 137 + difficulty * 7 + topic.length * 3
  const introVariation = seed % 6
  
  const introTexts = [
    `Этот урок посвящен изучению **${topic.toLowerCase()}** в ${langName}. Мы разберем не только синтаксис, но и поймем, как это работает "под капотом".`,
    `В этом уроке мы изучим основы **${topic.toLowerCase()}** в ${langName}. Каждая строка кода будет объяснена детально.`,
    `Здесь вы познакомитесь с **${topic.toLowerCase()}** в ${langName}. Мы разберем примеры кода построчно и поймем логику работы.`,
    `Данный урок расскажет о **${topic.toLowerCase()}** в ${langName}. Вы узнаете не только "как", но и "почему" именно так.`,
    `Мы рассмотрим **${topic.toLowerCase()}** в контексте ${langName}. Каждый пример будет сопровождаться подробными объяснениями.`,
    `Этот урок поможет освоить **${topic.toLowerCase()}** в ${langName}. Мы разберем код пошагово и объясним каждую конструкцию.`
  ]
  
  // Генерируем детальное объяснение кода
  const codeExample = generateCodeExample(language, topic, difficulty, chapterIndex, lessonIndex)
  const codeExplanation = generateDetailedCodeExplanation(language, topic, codeExample, difficulty, chapterIndex, lessonIndex)
  
  return `# ${topic} - Часть ${lessonIndex + 1}

## Введение

${introTexts[introVariation]}

## Что такое ${topic}?

${generateWhatIsExplanation(language, topic, difficulty)}

## Основные концепции

${generateConcepts(language, topic, difficulty, chapterIndex, lessonIndex)}

## Пример кода

Давайте рассмотрим пример кода, который демонстрирует ${topic.toLowerCase()}:

\`\`\`${language}
${codeExample}
\`\`\`

## Пошаговое объяснение кода

${codeExplanation}

## Как это работает?

${generateHowItWorksExplanation(language, topic, difficulty, chapterIndex, lessonIndex)}

## Практические советы

${generateTips(language, topic, difficulty, chapterIndex, lessonIndex)}

## Частые ошибки

${generateCommonMistakes(language, topic, difficulty)}

## Дополнительные материалы

Для более глубокого изучения рекомендуется:
- Практиковаться с примерами из урока
- Экспериментировать с кодом, изменяя параметры
- Изучать официальную документацию ${langName}
- Решать практические задачи
`
}

// Генерация концепций
function generateConcepts(language: Language, topic: string, difficulty: number, chapterIndex?: number, lessonIndex?: number): string {
  // Создаем уникальный seed для вариаций
  const seed = (chapterIndex || 0) * 100 + (lessonIndex || 0) * 17 + difficulty * 3
  const variation = seed % 5
  
  const conceptVariations = [
    [
      `**Основы ${topic.toLowerCase()}** - базовые понятия и принципы работы`,
      `**Синтаксис** - правильное написание кода на ${language}`,
    ],
    [
      `**Введение в ${topic.toLowerCase()}** - первые шаги и основные концепции`,
      `**Структура кода** - организация и форматирование на ${language}`,
    ],
    [
      `**Принципы ${topic.toLowerCase()}** - фундаментальные основы`,
      `**Стиль программирования** - лучшие практики для ${language}`,
    ],
    [
      `**Основные элементы ${topic.toLowerCase()}** - ключевые компоненты`,
      `**Правила написания** - стандарты кодирования на ${language}`,
    ],
    [
      `**Базовые концепции ${topic.toLowerCase()}** - начальные знания`,
      `**Код-стиль** - рекомендации по оформлению в ${language}`,
    ],
  ]
  
  const concepts = conceptVariations[variation] || conceptVariations[0]
  
  const additionalConcepts = [
    `**Применение** - где и как использовать ${topic.toLowerCase()}`,
    `**Лучшие практики** - рекомендации по использованию`,
    `**Частые ошибки** - что избегать при работе с ${topic.toLowerCase()}`,
    `**Оптимизация** - как улучшить производительность`,
    `**Отладка** - методы поиска и исправления ошибок`,
  ]
  
  const selectedConcepts = [...concepts, ...additionalConcepts.slice(0, Math.min(2, difficulty))]
  
  return selectedConcepts.map(c => `- ${c}`).join('\n')
}

// Генерация примера кода
function generateCodeExample(language: Language, topic: string, difficulty: number, chapterIndex?: number, lessonIndex?: number): string {
  // Создаем уникальный seed для вариаций примеров
  const seed = (chapterIndex || 0) * 100 + (lessonIndex || 0) * 17 + difficulty * 3
  const numVar = (seed % 20) + 1
  const numVar2 = ((seed * 3) % 15) + 5
  const examples: Partial<Record<Language, Record<number, string | ((num1: number, num2: number) => string)>>> = {
    python: {
      1: (num1: number, num2: number) => `# Простой пример\nprint("Привет, ${topic}!")\nresult = ${num1} + ${num2}\nprint(result)`,
      5: (num1: number, num2: number) => `# Пример средней сложности\ndef process_data(data):\n    return [x * ${num2} for x in data if x > 0]\n\nresult = process_data([${num1}, ${num2}, ${num1 + num2}])\nprint(result)`,
      10: (num1: number, num2: number) => `# Продвинутый пример\nfrom typing import List, Optional\n\nclass DataProcessor:\n    def __init__(self, data: List[int]):\n        self.data = data\n    \n    def process(self) -> Optional[List[int]]:\n        return [x ** ${num2} for x in self.data if x % 2 == 0]\n\nprocessor = DataProcessor([${num1}, ${num2}, ${num1 + num2}, ${num2 * 2}])\nresult = processor.process()\nprint(result)`
    },
    javascript: {
      1: (num1: number, num2: number) => `// Простой пример\nconsole.log("Привет, ${topic}!");\nconst result = ${num1} + ${num2};\nconsole.log(result);`,
      5: (num1: number, num2: number) => `// Пример средней сложности\nconst processData = (data) => {\n    return data.filter(x => x > 0).map(x => x * ${num2});\n};\n\nconst result = processData([${num1}, ${num2}, ${num1 + num2}]);\nconsole.log(result);`,
      10: (num1: number, num2: number) => `// Продвинутый пример\nclass DataProcessor {\n    constructor(data) {\n        this.data = data;\n    }\n    \n    process() {\n        return this.data\n            .filter(x => x % 2 === 0)\n            .map(x => x ** ${num2});\n    }\n}\n\nconst processor = new DataProcessor([${num1}, ${num2}, ${num1 + num2}, ${num2 * 2}]);\nconst result = processor.process();\nconsole.log(result);`
    },
    java: {
      1: (num1: number, num2: number) => `// Простой пример\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Привет, ${topic}!");\n        int result = ${num1} + ${num2};\n        System.out.println(result);\n    }\n}`,
      5: (num1: number, num2: number) => `// Пример средней сложности\nimport java.util.*;\n\npublic class Main {\n    public static List<Integer> processData(List<Integer> data) {\n        return data.stream()\n            .filter(x -> x > 0)\n            .map(x -> x * ${num2})\n            .collect(Collectors.toList());\n    }\n}`,
      10: (num1: number, num2: number) => `// Продвинутый пример\nimport java.util.*;\nimport java.util.stream.Collectors;\n\npublic class DataProcessor {\n    private List<Integer> data;\n    \n    public DataProcessor(List<Integer> data) {\n        this.data = data;\n    }\n    \n    public List<Integer> process() {\n        return data.stream()\n            .filter(x -> x % 2 == 0)\n            .map(x -> x * x)\n            .collect(Collectors.toList());\n    }\n}`
    },
    cpp: {
      1: (num1: number, num2: number) => `// Простой пример\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Привет, " << "${topic}" << "!" << endl;\n    int result = ${num1} + ${num2};\n    cout << result << endl;\n    return 0;\n}`,
      5: (num1: number, num2: number) => `// Пример средней сложности\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    vector<int> data = {${num1}, ${num2}, ${num1 + num2}};\n    transform(data.begin(), data.end(), data.begin(),\n              [](int x) { return x * ${num2}; });\n    return 0;\n}`,
      10: (num1: number, num2: number) => `// Продвинутый пример\n#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <memory>\n\nclass DataProcessor {\nprivate:\n    std::vector<int> data;\npublic:\n    DataProcessor(std::vector<int> d) : data(d) {}\n    std::vector<int> process() {\n        std::vector<int> result;\n        std::copy_if(data.begin(), data.end(),\n                     std::back_inserter(result),\n                     [](int x) { return x % 2 == 0; });\n        std::transform(result.begin(), result.end(),\n                      result.begin(),\n                      [](int x) { return x * x; });\n        return result;\n    }\n};`
    },
    csharp: {
      1: (num1: number, num2: number) => `// Простой пример\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Привет, ${topic}!");\n        int result = ${num1} + ${num2};\n        Console.WriteLine(result);\n    }\n}`,
      5: (num1: number, num2: number) => `// Пример средней сложности\nusing System;\nusing System.Linq;\n\nclass Program {\n    static void Main() {\n        var data = new[] { ${num1}, ${num2}, ${num1 + num2} };\n        var result = data.Where(x => x > 0).Select(x => x * ${num2});\n        Console.WriteLine(string.Join(", ", result));\n    }\n}`,
      10: (num1: number, num2: number) => `// Продвинутый пример\nusing System;\nusing System.Collections.Generic;\nusing System.Linq;\n\npublic class DataProcessor {\n    private List<int> data;\n    \n    public DataProcessor(List<int> data) {\n        this.data = data;\n    }\n    \n    public List<int> Process() {\n        return data\n            .Where(x => x % 2 == 0)\n            .Select(x => x * x)\n            .ToList();\n    }\n}`
    }
  }
  
  const level = difficulty <= 3 ? 1 : difficulty <= 7 ? 5 : 10
  const exampleFunc = examples[language]?.[level] || examples[language]?.[1]
  
  if (typeof exampleFunc === 'function') {
    return exampleFunc(numVar, numVar2)
  }
  
  return exampleFunc || `// Пример кода\nconsole.log("Пример");`
}

// Генерация советов
function generateTips(language: Language, topic: string, difficulty: number, chapterIndex?: number, lessonIndex?: number): string {
  const seed = (chapterIndex || 0) * 100 + (lessonIndex || 0) * 17 + difficulty * 3
  const tipVariation = seed % 4
  
  const tipVariations = [
    `- Изучите синтаксис ${topic.toLowerCase()}\n- Практикуйтесь с примерами\n- Экспериментируйте с кодом\n- Читайте документацию`,
    `- Освойте основы ${topic.toLowerCase()}\n- Решайте практические задачи\n- Анализируйте чужой код\n- Следуйте best practices`,
    `- Понимайте принципы ${topic.toLowerCase()}\n- Пишите код регулярно\n- Изучайте паттерны проектирования\n- Используйте отладчик`,
    `- Изучайте ${topic.toLowerCase()} постепенно\n- Создавайте собственные проекты\n- Участвуйте в code review\n- Изучайте стандарты кодирования`
  ]
  
  return tipVariations[tipVariation] || tipVariations[0]
}

// Генерация практического задания - УНИКАЛЬНОЕ для каждого урока
function generatePractice(
  language: Language,
  topic: string,
  difficulty: number,
  chapterIndex: number,
  lessonIndex: number
) {
  // Создаем уникальный индекс на основе главы и урока
  // Используем очень большие множители для максимальной уникальности
  // Добавляем topic.length для еще большей вариативности
  const uniqueIndex = chapterIndex * 10000 + lessonIndex * 1000 + difficulty * 100 + (topic.length * 17) + (topic.charCodeAt(0) || 0)
  
  // Генерируем уникальные задания для каждого урока
  const practiceTasks = generateUniquePracticeTasks(language, topic, difficulty, uniqueIndex, lessonIndex)
  
  return practiceTasks
}

// Генерация уникальных практических заданий
function generateUniquePracticeTasks(
  language: Language,
  topic: string,
  difficulty: number,
  uniqueIndex: number,
  lessonIndex: number
) {
  // Генерируем уникальные задания на основе uniqueIndex
  const taskVariations = generateTaskVariations(language, topic, difficulty, uniqueIndex, lessonIndex)
  return taskVariations
}

// Генерация вариаций заданий для уникальности каждого урока
function generateTaskVariations(
  language: Language,
  topic: string,
  difficulty: number,
  uniqueIndex: number,
  lessonIndex: number
) {
  // Создаем полностью уникальное задание на основе всех параметров
  return createFullyUniqueTask(language, topic, difficulty, uniqueIndex, lessonIndex)
}

// Создание полностью уникального задания
function createFullyUniqueTask(
  language: Language,
  topic: string,
  difficulty: number,
  uniqueIndex: number,
  lessonIndex: number
) {
  // Генерируем уникальные числа для каждого урока
  // Используем более сложную формулу для большей уникальности
  const seed = uniqueIndex * 31 + lessonIndex * 47 + difficulty * 13 + (topic.length * 7)
  const num1 = (seed % 50) + 1
  const num2 = ((seed * 3) % 30) + 5
  const num3 = ((seed * 5) % 20) + 10
  const num4 = ((seed * 7) % 15) + 2
  
  // Генерируем уникальные операторы и действия
  const operations = ['+', '-', '*', '/', '%', '**']
  const opIndex = ((seed * 11) % operations.length)
  const operation = operations[opIndex]
  
  // Генерируем тип задания на основе uniqueIndex с дополнительной вариацией
  const taskType = (uniqueIndex + lessonIndex * 3) % 15
  
  // Создаем уникальное задание в зависимости от типа
  return generateTaskByType(language, topic, difficulty, taskType, num1, num2, num3, num4, operation, uniqueIndex, lessonIndex)
}

// Генерация задания по типу
function generateTaskByType(
  language: Language,
  topic: string,
  difficulty: number,
  taskType: number,
  num1: number,
  num2: number,
  num3: number,
  num4: number,
  operation: string,
  uniqueIndex: number,
  lessonIndex: number
) {
  const langTemplates = getLanguageTemplates(language)
  
  switch (taskType) {
    case 0:
      return createCalculationTask(language, num1, num2, operation, uniqueIndex, langTemplates)
    case 1:
      return createArrayTask(language, num1, num2, num3, uniqueIndex, langTemplates)
    case 2:
      return createStringTask(language, topic, num1, uniqueIndex, langTemplates)
    case 3:
      return createConditionTask(language, num1, num2, uniqueIndex, langTemplates)
    case 4:
      return createLoopTask(language, num1, num2, uniqueIndex, langTemplates)
    case 5:
      return createFunctionTask(language, num1, num2, num3, uniqueIndex, langTemplates)
    case 6:
      return createClassTask(language, num1, num2, uniqueIndex, langTemplates)
    case 7:
      return createMathTask(language, num1, num2, num3, num4, uniqueIndex, langTemplates)
    case 8:
      return createSearchTask(language, num1, num2, uniqueIndex, langTemplates)
    case 9:
      return createSortTask(language, num1, num2, uniqueIndex, langTemplates)
    case 10:
      return createFilterTask(language, num1, num2, uniqueIndex, langTemplates)
    case 11:
      return createTransformTask(language, num1, num2, uniqueIndex, langTemplates)
    case 12:
      return createCountTask(language, num1, num2, uniqueIndex, langTemplates)
    case 13:
      return createSumTask(language, num1, num2, uniqueIndex, langTemplates)
    case 14:
      return createMaxMinTask(language, num1, num2, num3, uniqueIndex, langTemplates)
    default:
      return createCalculationTask(language, num1, num2, operation, uniqueIndex, langTemplates)
  }
}

// Генерация уникального описания задания
function generateUniqueDescription(uniqueIndex: number, category: string): string {
  const variations: Record<string, string[]> = {
    'массивы': [
      `Практика: Работа с массивами`,
      `Упражнение: Массивы и списки`,
      `Задание: Операции с массивами`,
      `Практическое задание: Списки`,
      `Упражнение: Работа со списками`,
      `Задача: Массивы`
    ],
    'строки': [
      `Практика: Работа со строками`,
      `Упражнение: Строковые операции`,
      `Задание: Обработка строк`,
      `Практическое задание: Строки`,
      `Упражнение: Манипуляции со строками`,
      `Задача: Строки`
    ],
    'условия': [
      `Практика: Условные операторы`,
      `Упражнение: Условия и ветвления`,
      `Задание: Логические выражения`,
      `Практическое задание: if-else`,
      `Упражнение: Условная логика`,
      `Задача: Условия`
    ],
    'циклы': [
      `Практика: Циклы`,
      `Упражнение: Итерации`,
      `Задание: Повторяющиеся действия`,
      `Практическое задание: Циклы`,
      `Упражнение: Перебор элементов`,
      `Задача: Циклы`
    ],
    'функции': [
      `Практика: Функции`,
      `Упражнение: Создание функций`,
      `Задание: Модульное программирование`,
      `Практическое задание: Функции`,
      `Упражнение: Переиспользуемый код`,
      `Задача: Функции`
    ],
    'классы': [
      `Практика: Классы`,
      `Упражнение: Объектно-ориентированное программирование`,
      `Задание: Создание классов`,
      `Практическое задание: ООП`,
      `Упражнение: Классы и объекты`,
      `Задача: Классы`
    ],
    'математика': [
      `Практика: Математические выражения`,
      `Упражнение: Вычисления`,
      `Задание: Математические операции`,
      `Практическое задание: Расчеты`,
      `Упражнение: Математика`,
      `Задача: Вычисления`
    ],
    'поиск': [
      `Практика: Поиск в массиве`,
      `Упражнение: Поиск элементов`,
      `Задание: Поиск данных`,
      `Практическое задание: Поиск`,
      `Упражнение: Нахождение элементов`,
      `Задача: Поиск`
    ],
    'сортировка': [
      `Практика: Сортировка`,
      `Упражнение: Упорядочивание`,
      `Задание: Сортировка массивов`,
      `Практическое задание: Сортировка`,
      `Упражнение: Порядок элементов`,
      `Задача: Сортировка`
    ],
    'фильтрация': [
      `Практика: Фильтрация`,
      `Упражнение: Отбор элементов`,
      `Задание: Фильтрация данных`,
      `Практическое задание: Фильтры`,
      `Упражнение: Отбор по условию`,
      `Задача: Фильтрация`
    ],
    'преобразование': [
      `Практика: Преобразование массива`,
      `Упражнение: Трансформация данных`,
      `Задание: Модификация элементов`,
      `Практическое задание: Преобразования`,
      `Упражнение: Изменение массива`,
      `Задача: Преобразование`
    ],
    'подсчет': [
      `Практика: Подсчет элементов`,
      `Упражнение: Счетчики`,
      `Задание: Количество элементов`,
      `Практическое задание: Подсчет`,
      `Упражнение: Счет`,
      `Задача: Подсчет`
    ],
    'сумма': [
      `Практика: Сумма элементов`,
      `Упражнение: Суммирование`,
      `Задание: Вычисление суммы`,
      `Практическое задание: Сумма`,
      `Упражнение: Сложение элементов`,
      `Задача: Сумма`
    ],
    'максимум': [
      `Практика: Поиск максимума`,
      `Упражнение: Максимальное значение`,
      `Задание: Нахождение максимума`,
      `Практическое задание: Максимум`,
      `Упражнение: Наибольший элемент`,
      `Задача: Максимум`
    ],
    'вычисления': [
      `Практика: Вычисления`,
      `Упражнение: Арифметика`,
      `Задание: Математические операции`,
      `Практическое задание: Расчеты`,
      `Упражнение: Вычисления`,
      `Задача: Математика`
    ]
  }
  
  const categoryVariations = variations[category] || variations['вычисления']
  return categoryVariations[uniqueIndex % categoryVariations.length]
}

// Получение шаблонов для языка
function getLanguageTemplates(language: Language) {
  const templates: Partial<Record<Language, any>> = {
    python: {
      print: 'print',
      array: 'list',
      function: 'def',
      class: 'class',
      main: ''
    },
    javascript: {
      print: 'console.log',
      array: 'array',
      function: 'function',
      class: 'class',
      main: ''
    },
    java: {
      print: 'System.out.println',
      array: 'List',
      function: 'public static',
      class: 'class',
      main: 'public static void main(String[] args)'
    },
    cpp: {
      print: 'cout',
      array: 'vector',
      function: '',
      class: 'class',
      main: 'int main()'
    },
    csharp: {
      print: 'Console.WriteLine',
      array: 'List',
      function: 'static',
      class: 'class',
      main: 'static void Main()'
    }
  }
  return templates[language]
}

// Создание заданий разных типов
function createCalculationTask(language: Language, num1: number, num2: number, op: string, uniqueIndex: number, templates: any) {
  let result: number
  switch (op) {
    case '+': result = num1 + num2; break
    case '-': result = num1 - num2; break
    case '*': result = num1 * num2; break
    case '/': result = Math.floor(num1 / num2); break
    case '%': result = num1 % num2; break
    case '**': result = Math.pow(num1, Math.min(num2, 5)); break
    default: result = num1 + num2
  }
  
  // Создаем уникальные варианты текста задания
  const taskVariations = [
    `Напишите программу, которая вычисляет ${num1} ${op} ${num2} и выводит результат`,
    `Создайте программу для вычисления выражения ${num1} ${op} ${num2}`,
    `Реализуйте вычисление ${num1} ${op} ${num2} и отобразите результат`,
    `Напишите код, который выполняет операцию ${num1} ${op} ${num2}`,
    `Создайте функцию, вычисляющую ${num1} ${op} ${num2}`,
    `Реализуйте программу для расчета ${num1} ${op} ${num2}`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  
  const descVariations = [
    `Задание: Арифметические операции`,
    `Практика: Математические вычисления`,
    `Упражнение: Работа с операторами`,
    `Задача: Выполнение расчетов`,
    `Практическое задание: Операции`,
    `Упражнение: Арифметика`
  ]
  const description = descVariations[uniqueIndex % descVariations.length]
  
  if (language === 'python') {
    return {
      description: description,
      task: taskText,
      starterCode: `# Вычислите ${num1} ${op} ${num2}\n${templates.print}("Результат: ")`,
      expectedOutput: new RegExp(`${result}|Результат.*${result}`, 'i'),
      testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Проверка: ${num1} ${op} ${num2} = ${result}` }],
      hints: [`Используйте оператор ${op}`, `Выведите результат с помощью ${templates.print}()`]
    }
  } else if (language === 'javascript') {
    return {
      description: description,
      task: taskText,
      starterCode: `// Вычислите ${num1} ${op} ${num2}\n${templates.print}("Результат: ");`,
      expectedOutput: new RegExp(`${result}|Результат.*${result}`, 'i'),
      testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Проверка: ${num1} ${op} ${num2} = ${result}` }],
      hints: [`Используйте оператор ${op}`, `Выведите результат с помощью ${templates.print}()`]
    }
  }
  
  // Для других языков - упрощенная версия
  return {
    description: description,
    task: taskText,
    starterCode: `// Напишите код здесь`,
    expectedOutput: new RegExp(`${result}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Проверка результата` }],
    hints: [`Используйте оператор ${op}`, `Результат должен быть ${result}`]
  }
}

function createArrayTask(language: Language, num1: number, num2: number, num3: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Создайте массив из чисел [${num1}, ${num2}, ${num3}] и найдите сумму всех элементов`,
    `Реализуйте программу, которая создает список [${num1}, ${num2}, ${num3}] и вычисляет сумму`,
    `Напишите код для работы с массивом [${num1}, ${num2}, ${num3}] и подсчета суммы`,
    `Создайте массив чисел [${num1}, ${num2}, ${num3}] и вычислите общую сумму`,
    `Реализуйте функцию, которая принимает [${num1}, ${num2}, ${num3}] и возвращает сумму`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const result = num1 + num2 + num3
  
  const descVariations = [
    `Практика: Работа с массивами`,
    `Упражнение: Массивы и списки`,
    `Задание: Операции с массивами`,
    `Практическое задание: Списки`,
    `Упражнение: Работа со списками`
  ]
  const description = descVariations[uniqueIndex % descVariations.length]
  
  if (language === 'python') {
    return {
      description: description,
      task: taskText,
      starterCode: `numbers = [${num1}, ${num2}, ${num3}]\n# Найдите сумму\nsum_result = 0\n${templates.print}(sum_result)`,
      expectedOutput: new RegExp(`${result}`, 'i'),
      testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Сумма должна быть ${result}` }],
      hints: ['Используйте цикл for', 'Или функцию sum()']
    }
  }
  
  return {
    description: description,
    task: taskText,
    starterCode: `// Создайте массив и найдите сумму`,
    expectedOutput: new RegExp(`${result}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Сумма должна быть ${result}` }],
    hints: ['Создайте массив', 'Используйте цикл для суммирования']
  }
}

function createStringTask(language: Language, topic: string, num1: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Напишите программу, которая выводит "${topic}" ${num1} раз`,
    `Создайте код, который повторяет "${topic}" ${num1} раз`,
    `Реализуйте программу для вывода "${topic}" ${num1} раз`,
    `Напишите функцию, выводящую "${topic}" ${num1} раз`,
    `Создайте цикл, который выводит "${topic}" ${num1} раз`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  // Экранируем специальные символы для регулярного выражения
  const escapedTopic = topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const description = generateUniqueDescription(uniqueIndex, 'строки')
  
  if (language === 'python') {
    return {
      description: description,
      task: taskText,
      starterCode: `# Выведите "${topic}" ${num1} раз\nfor i in range(${num1}):\n    ${templates.print}("${topic}")`,
      expectedOutput: new RegExp(escapedTopic, 'i'),
      testCases: [{ expectedOutput: new RegExp(escapedTopic, 'i'), description: `Должно быть выведено "${topic}"` }],
      hints: ['Используйте цикл for', `Используйте ${templates.print}()`]
    }
  }
  
  return {
    description: description,
    task: taskText,
    starterCode: `// Выведите "${topic}" ${num1} раз`,
    expectedOutput: new RegExp(escapedTopic, 'i'),
    testCases: [{ expectedOutput: new RegExp(escapedTopic, 'i'), description: `Должно быть выведено "${topic}"` }],
    hints: ['Используйте цикл', 'Выводите строку']
  }
}

function createConditionTask(language: Language, num1: number, num2: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Напишите программу, которая проверяет, больше ли ${num1} чем ${num2}, и выводит "Да" или "Нет"`,
    `Создайте код для сравнения ${num1} и ${num2}`,
    `Реализуйте проверку: ${num1} > ${num2}?`,
    `Напишите условие для сравнения ${num1} и ${num2}`,
    `Создайте программу сравнения чисел ${num1} и ${num2}`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const result = num1 > num2 ? 'Да' : 'Нет'
  const description = generateUniqueDescription(uniqueIndex, 'условия')
  
  return {
    description: description,
    task: taskText,
    starterCode: `// Сравните ${num1} и ${num2}\nif ${num1} > ${num2}:\n    ${templates.print}("Да")\nelse:\n    ${templates.print}("Нет")`,
    expectedOutput: new RegExp(`${result}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Результат: ${result}` }],
    hints: ['Используйте if-else', 'Сравните числа']
  }
}

function createLoopTask(language: Language, num1: number, num2: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Напишите программу, которая выводит числа от ${num1} до ${num2}`,
    `Создайте цикл для вывода чисел от ${num1} до ${num2}`,
    `Реализуйте вывод последовательности от ${num1} до ${num2}`,
    `Напишите код, который перебирает числа от ${num1} до ${num2}`,
    `Создайте программу для вывода диапазона ${num1}-${num2}`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const description = generateUniqueDescription(uniqueIndex, 'циклы')
  
  return {
    description: description,
    task: taskText,
    starterCode: `# Выведите числа от ${num1} до ${num2}\nfor i in range(${num1}, ${num2 + 1}):\n    ${templates.print}(i)`,
    expectedOutput: new RegExp(`${num1}|${num2}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${num1}`, 'i'), description: `Должно начинаться с ${num1}` }],
    hints: ['Используйте цикл for', 'Используйте range()']
  }
}

function createFunctionTask(language: Language, num1: number, num2: number, num3: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Создайте функцию, которая принимает три числа и возвращает их среднее арифметическое`,
    `Напишите функцию для вычисления среднего из трех чисел`,
    `Реализуйте функцию, вычисляющую среднее значение`,
    `Создайте функцию average(a, b, c) для среднего арифметического`,
    `Напишите функцию, которая находит среднее трех чисел`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const result = Math.floor((num1 + num2 + num3) / 3)
  const description = generateUniqueDescription(uniqueIndex, 'функции')
  
  if (language === 'python') {
    return {
      description: description,
      task: taskText,
      starterCode: `def average(a, b, c):\n    # Вычислите среднее арифметическое\n    return 0\n\nresult = average(${num1}, ${num2}, ${num3})\n${templates.print}(result)`,
      expectedOutput: new RegExp(`${result}`, 'i'),
      testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Среднее: ${result}` }],
      hints: ['Сложите числа', 'Разделите на 3', 'Верните результат']
    }
  }
  
  return {
    description: description,
    task: taskText,
    starterCode: `// Создайте функцию для вычисления среднего`,
    expectedOutput: new RegExp(`${result}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Среднее: ${result}` }],
    hints: ['Создайте функцию', 'Вычислите среднее', 'Верните результат']
  }
}

function createClassTask(language: Language, num1: number, num2: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Создайте класс Calculator с методом multiply, который умножает два числа`,
    `Реализуйте класс Calculator с методом умножения`,
    `Напишите класс с методом для умножения чисел`,
    `Создайте класс Calculator и метод multiply`,
    `Реализуйте класс с функцией умножения`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const result = num1 * num2
  const description = generateUniqueDescription(uniqueIndex, 'классы')
  
  if (language === 'python') {
    return {
      description: description,
      task: taskText,
      starterCode: `class Calculator:\n    def multiply(self, a, b):\n        # Умножьте a на b\n        return 0\n\ncalc = Calculator()\nresult = calc.multiply(${num1}, ${num2})\n${templates.print}(result)`,
      expectedOutput: new RegExp(`${result}`, 'i'),
      testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Результат: ${result}` }],
      hints: ['Создайте класс', 'Добавьте метод multiply', 'Верните произведение']
    }
  }
  
  return {
    description: description,
    task: taskText,
    starterCode: `// Создайте класс Calculator`,
    expectedOutput: new RegExp(`${result}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Результат: ${result}` }],
    hints: ['Создайте класс', 'Добавьте метод', 'Реализуйте умножение']
  }
}

function createMathTask(language: Language, num1: number, num2: number, num3: number, num4: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Вычислите: (${num1} + ${num2}) * ${num3} - ${num4}`,
    `Напишите программу для расчета (${num1} + ${num2}) * ${num3} - ${num4}`,
    `Реализуйте вычисление выражения (${num1} + ${num2}) * ${num3} - ${num4}`,
    `Создайте код для формулы (${num1} + ${num2}) * ${num3} - ${num4}`,
    `Напишите функцию, вычисляющую (${num1} + ${num2}) * ${num3} - ${num4}`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const result = (num1 + num2) * num3 - num4
  const description = generateUniqueDescription(uniqueIndex, 'математика')
  
  return {
    description: description,
    task: taskText,
    starterCode: `# Вычислите выражение\nresult = (${num1} + ${num2}) * ${num3} - ${num4}\n${templates.print}(result)`,
    expectedOutput: new RegExp(`${result}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${result}`, 'i'), description: `Результат: ${result}` }],
    hints: ['Используйте скобки', 'Следуйте порядку операций']
  }
}

function createSearchTask(language: Language, num1: number, num2: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Создайте массив [${num1}, ${num2}, ${num1 + num2}] и проверьте, содержит ли он число ${num1}`,
    `Проверьте наличие ${num1} в массиве [${num1}, ${num2}, ${num1 + num2}]`,
    `Найдите число ${num1} в списке [${num1}, ${num2}, ${num1 + num2}]`,
    `Определите, есть ли ${num1} в массиве [${num1}, ${num2}, ${num1 + num2}]`,
    `Создайте код для поиска ${num1} в [${num1}, ${num2}, ${num1 + num2}]`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const description = generateUniqueDescription(uniqueIndex, 'поиск')
  
  return {
    description: description,
    task: taskText,
    starterCode: `arr = [${num1}, ${num2}, ${num1 + num2}]\n# Проверьте наличие ${num1}\nfound = ${num1} in arr\n${templates.print}(found)`,
    expectedOutput: /True|true|Да|да/,
    testCases: [{ expectedOutput: /True|true/, description: `Должно быть True` }],
    hints: ['Используйте оператор in', 'Или метод index()']
  }
}

function createSortTask(language: Language, num1: number, num2: number, uniqueIndex: number, templates: any) {
  const arr = [num2, num1, num1 + num2].sort((a, b) => a - b)
  const taskVariations = [
    `Отсортируйте массив [${num2}, ${num1}, ${num1 + num2}] по возрастанию`,
    `Упорядочьте элементы [${num2}, ${num1}, ${num1 + num2}] по возрастанию`,
    `Расположите числа [${num2}, ${num1}, ${num1 + num2}] в порядке возрастания`,
    `Отсортируйте список [${num2}, ${num1}, ${num1 + num2}] от меньшего к большему`,
    `Создайте код для сортировки [${num2}, ${num1}, ${num1 + num2}]`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const description = generateUniqueDescription(uniqueIndex, 'сортировка')
  
  return {
    description: description,
    task: taskText,
    starterCode: `arr = [${num2}, ${num1}, ${num1 + num2}]\n# Отсортируйте массив\narr.sort()\n${templates.print}(arr)`,
    expectedOutput: new RegExp(`${arr[0]}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${arr[0]}`, 'i'), description: `Первый элемент: ${arr[0]}` }],
    hints: ['Используйте метод sort()', 'Или функцию sorted()']
  }
}

function createFilterTask(language: Language, num1: number, num2: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Отфильтруйте четные числа из массива [${num1}, ${num2}, ${num1 + 1}, ${num2 + 1}]`,
    `Выберите только четные числа из [${num1}, ${num2}, ${num1 + 1}, ${num2 + 1}]`,
    `Найдите все четные элементы в [${num1}, ${num2}, ${num1 + 1}, ${num2 + 1}]`,
    `Отберите четные числа из списка [${num1}, ${num2}, ${num1 + 1}, ${num2 + 1}]`,
    `Создайте код для фильтрации четных чисел из [${num1}, ${num2}, ${num1 + 1}, ${num2 + 1}]`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const description = generateUniqueDescription(uniqueIndex, 'фильтрация')
  
  return {
    description: description,
    task: taskText,
    starterCode: `arr = [${num1}, ${num2}, ${num1 + 1}, ${num2 + 1}]\n# Отфильтруйте четные числа\neven = [x for x in arr if x % 2 == 0]\n${templates.print}(even)`,
    expectedOutput: /\d+/,
    testCases: [{ expectedOutput: /\d+/, description: 'Должны быть четные числа' }],
    hints: ['Используйте списковые включения', 'Проверьте остаток от деления']
  }
}

function createTransformTask(language: Language, num1: number, num2: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Умножьте каждый элемент массива [${num1}, ${num2}] на ${num2}`,
    `Примените умножение на ${num2} к каждому элементу [${num1}, ${num2}]`,
    `Преобразуйте массив [${num1}, ${num2}], умножив каждый элемент на ${num2}`,
    `Измените элементы [${num1}, ${num2}], умножив их на ${num2}`,
    `Создайте код для умножения всех элементов [${num1}, ${num2}] на ${num2}`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const result1 = num1 * num2
  const result2 = num2 * num2
  const description = generateUniqueDescription(uniqueIndex, 'преобразование')
  
  return {
    description: description,
    task: taskText,
    starterCode: `arr = [${num1}, ${num2}]\n# Умножьте каждый элемент на ${num2}\nresult = [x * ${num2} for x in arr]\n${templates.print}(result)`,
    expectedOutput: new RegExp(`${result1}|${result2}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${result1}`, 'i'), description: `Первый элемент: ${result1}` }],
    hints: ['Используйте списковые включения', 'Или метод map()']
  }
}

function createCountTask(language: Language, num1: number, num2: number, uniqueIndex: number, templates: any) {
  const taskVariations = [
    `Подсчитайте количество элементов в массиве [${num1}, ${num2}, ${num1 + num2}, ${num2 * 2}]`,
    `Найдите длину массива [${num1}, ${num2}, ${num1 + num2}, ${num2 * 2}]`,
    `Определите количество элементов в [${num1}, ${num2}, ${num1 + num2}, ${num2 * 2}]`,
    `Вычислите размер массива [${num1}, ${num2}, ${num1 + num2}, ${num2 * 2}]`,
    `Создайте код для подсчета элементов в [${num1}, ${num2}, ${num1 + num2}, ${num2 * 2}]`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const description = generateUniqueDescription(uniqueIndex, 'подсчет')
  
  return {
    description: description,
    task: taskText,
    starterCode: `arr = [${num1}, ${num2}, ${num1 + num2}, ${num2 * 2}]\n# Подсчитайте количество элементов\ncount = len(arr)\n${templates.print}(count)`,
    expectedOutput: /4/,
    testCases: [{ expectedOutput: /4/, description: 'Количество: 4' }],
    hints: ['Используйте функцию len()', 'Или свойство length']
  }
}

function createSumTask(language: Language, num1: number, num2: number, uniqueIndex: number, templates: any) {
  const arr = [num1, num2, num1 + num2]
  const sum = arr.reduce((a, b) => a + b, 0)
  const taskVariations = [
    `Найдите сумму элементов массива [${num1}, ${num2}, ${num1 + num2}]`,
    `Вычислите сумму чисел в [${num1}, ${num2}, ${num1 + num2}]`,
    `Сложите все элементы массива [${num1}, ${num2}, ${num1 + num2}]`,
    `Найдите общую сумму элементов [${num1}, ${num2}, ${num1 + num2}]`,
    `Создайте код для суммирования [${num1}, ${num2}, ${num1 + num2}]`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const description = generateUniqueDescription(uniqueIndex, 'сумма')
  
  return {
    description: description,
    task: taskText,
    starterCode: `arr = [${num1}, ${num2}, ${num1 + num2}]\n# Найдите сумму\nsum_result = sum(arr)\n${templates.print}(sum_result)`,
    expectedOutput: new RegExp(`${sum}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${sum}`, 'i'), description: `Сумма: ${sum}` }],
    hints: ['Используйте функцию sum()', 'Или цикл для суммирования']
  }
}

function createMaxMinTask(language: Language, num1: number, num2: number, num3: number, uniqueIndex: number, templates: any) {
  const arr = [num1, num2, num3]
  const max = Math.max(...arr)
  const taskVariations = [
    `Найдите максимальный элемент в массиве [${num1}, ${num2}, ${num3}]`,
    `Определите наибольшее число в [${num1}, ${num2}, ${num3}]`,
    `Найдите максимум среди чисел [${num1}, ${num2}, ${num3}]`,
    `Вычислите наибольший элемент массива [${num1}, ${num2}, ${num3}]`,
    `Создайте код для поиска максимума в [${num1}, ${num2}, ${num3}]`
  ]
  const taskText = taskVariations[uniqueIndex % taskVariations.length]
  const description = generateUniqueDescription(uniqueIndex, 'максимум')
  
  return {
    description: description,
    task: taskText,
    starterCode: `arr = [${num1}, ${num2}, ${num3}]\n# Найдите максимальный элемент\nmax_value = max(arr)\n${templates.print}(max_value)`,
    expectedOutput: new RegExp(`${max}`, 'i'),
    testCases: [{ expectedOutput: new RegExp(`${max}`, 'i'), description: `Максимум: ${max}` }],
    hints: ['Используйте функцию max()', 'Или цикл для поиска']
  }
}

// Генерация объяснения "Что это такое?"
function generateWhatIsExplanation(language: Language, topic: string, difficulty: number): string {
  const explanations: Record<string, Record<number, string[]>> = {
    'Переменные': {
      1: [
        '**Переменная** - это именованная область памяти, где хранятся данные.',
        'Представьте переменную как коробку с названием, в которую можно положить значение.',
        'В Python переменные создаются простым присваиванием: `x = 5` означает "создать переменную x и положить в неё число 5".'
      ],
      5: [
        '**Переменные** - это ссылки на объекты в памяти.',
        'В Python переменная не хранит значение напрямую, а указывает на объект в памяти.',
        'Когда вы пишете `x = 5`, Python создает объект-число 5 в памяти, а переменная x становится ссылкой на этот объект.'
      ]
    },
    'Функции': {
      1: [
        '**Функция** - это блок кода, который можно вызывать многократно.',
        'Функция принимает входные данные (параметры), выполняет действия и может возвращать результат.',
        'Это как рецепт: вы даете ингредиенты (параметры), функция готовит (выполняет код) и возвращает блюдо (результат).'
      ],
      5: [
        '**Функции** - это объекты первого класса в Python, их можно передавать как аргументы, возвращать из других функций.',
        'Функция инкапсулирует логику, делает код переиспользуемым и тестируемым.',
        'В Python функции определяются через `def`, могут иметь параметры по умолчанию, *args, **kwargs.'
      ]
    },
    'Классы': {
      1: [
        '**Класс** - это шаблон для создания объектов.',
        'Класс определяет структуру и поведение объектов определенного типа.',
        'Представьте класс как чертеж дома: класс описывает, как должен выглядеть дом, а объект - это конкретный построенный дом.'
      ],
      5: [
        '**Классы** в Python поддерживают наследование, полиморфизм, инкапсуляцию.',
        'Класс содержит атрибуты (данные) и методы (функции).',
        'При создании объекта вызывается конструктор `__init__`, который инициализирует атрибуты объекта.'
      ]
    }
  }
  
  const topicKey = Object.keys(explanations).find(k => topic.includes(k)) || 'общая тема'
  const level = difficulty <= 3 ? 1 : 5
  const explanation = explanations[topicKey]?.[level] || [
    `**${topic}** - это важная концепция в программировании на ${language}.`,
    `Она позволяет организовать код более структурированно и эффективно.`,
    `В этом уроке мы детально разберем, как это работает и как правильно использовать.`
  ]
  
  return explanation.join('\n\n')
}

// Генерация детального объяснения кода построчно
function generateDetailedCodeExplanation(language: Language, topic: string, code: string, difficulty: number, chapterIndex: number, lessonIndex: number): string {
  const lines = code.split('\n').filter(line => line.trim())
  const seed = chapterIndex * 100 + lessonIndex * 17 + difficulty * 3
  const explanationStyle = seed % 3
  
  let explanation = ''
  
  if (explanationStyle === 0) {
    // Построчное объяснение
    explanation = 'Разберем код построчно:\n\n'
    lines.forEach((line, index) => {
      if (line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('#')) {
        explanation += `**Строка ${index + 1}:** \`${line.trim()}\`\n`
        explanation += generateLineExplanation(language, line, topic) + '\n\n'
      }
    })
  } else if (explanationStyle === 1) {
    // Блочное объяснение
    explanation = 'Разберем код по блокам:\n\n'
    const blocks = identifyCodeBlocks(code, language)
    blocks.forEach((block, index) => {
      explanation += `**Блок ${index + 1}:**\n\`\`\`${language}\n${block}\n\`\`\`\n`
      explanation += generateBlockExplanation(language, block, topic) + '\n\n'
    })
  } else {
    // Концептуальное объяснение
    explanation = '**Что происходит в этом коде?**\n\n'
    explanation += generateConceptualExplanation(language, code, topic, difficulty)
  }
  
  return explanation
}

// Объяснение одной строки кода
function generateLineExplanation(language: Language, line: string, topic: string): string {
  const trimmed = line.trim()
  
  // Определяем тип строки
  if (trimmed.includes('def ') || trimmed.includes('function ') || trimmed.includes('public static')) {
    return 'Это определение функции. Ключевое слово `def` (или `function`) говорит Python/JavaScript, что мы создаем новую функцию.'
  }
  if (trimmed.includes('class ')) {
    return 'Это определение класса. Класс - это шаблон для создания объектов с определенными свойствами и методами.'
  }
  if (trimmed.includes('=') && !trimmed.includes('==')) {
    return 'Это присваивание значения переменной. Справа от `=` вычисляется выражение, результат сохраняется в переменную слева.'
  }
  if (trimmed.includes('if ')) {
    return 'Это условный оператор. Если условие после `if` истинно (True), выполнится код внутри блока.'
  }
  if (trimmed.includes('for ') || trimmed.includes('while ')) {
    return 'Это цикл. Цикл повторяет выполнение блока кода, пока условие истинно или пока не пройдены все элементы.'
  }
  if (trimmed.includes('return ')) {
    return 'Это оператор возврата. Функция прекращает выполнение и возвращает указанное значение.'
  }
  if (trimmed.includes('print') || trimmed.includes('console.log') || trimmed.includes('System.out.println')) {
    return 'Это вывод данных на экран. Функция print выводит переданное значение в консоль.'
  }
  
  return 'Эта строка выполняет операцию в рамках изучаемой темы.'
}

// Идентификация блоков кода
function identifyCodeBlocks(code: string, language: Language): string[] {
  const blocks: string[] = []
  const lines = code.split('\n')
  let currentBlock: string[] = []
  let indentLevel = 0
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue
    
    const currentIndent = line.match(/^(\s*)/)?.[1].length || 0
    
    if (currentIndent === 0 && currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n'))
      currentBlock = []
    }
    
    currentBlock.push(line)
  }
  
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'))
  }
  
  return blocks.length > 0 ? blocks : [code]
}

// Объяснение блока кода
function generateBlockExplanation(language: Language, block: string, topic: string): string {
  if (block.includes('def ') || block.includes('function ')) {
    return 'Этот блок определяет функцию. Функция инкапсулирует логику, которую можно вызывать многократно с разными параметрами.'
  }
  if (block.includes('class ')) {
    return 'Этот блок определяет класс. Класс содержит атрибуты (данные) и методы (функции), которые работают с этими данными.'
  }
  if (block.includes('if ')) {
    return 'Этот блок содержит условную логику. Код выполняется только если условие истинно.'
  }
  if (block.includes('for ') || block.includes('while ')) {
    return 'Этот блок содержит цикл. Цикл повторяет выполнение кода внутри себя.'
  }
  
  return 'Этот блок кода демонстрирует использование изучаемой концепции.'
}

// Концептуальное объяснение
function generateConceptualExplanation(language: Language, code: string, topic: string, difficulty: number): string {
  const explanations = [
    `В этом коде мы используем ${topic.toLowerCase()} для решения задачи. Код работает следующим образом: сначала инициализируются переменные, затем выполняется основная логика, и в конце выводится результат.`,
    `Данный пример показывает практическое применение ${topic.toLowerCase()}. Мы создаем необходимые структуры данных, обрабатываем их с помощью изученных конструкций и получаем итоговый результат.`,
    `Этот код демонстрирует ключевые аспекты ${topic.toLowerCase()}. Каждая часть кода выполняет свою роль: подготовка данных, обработка и вывод результата.`
  ]
  
  const seed = code.length + difficulty
  return explanations[seed % explanations.length]
}

// Генерация объяснения "Как это работает?"
function generateHowItWorksExplanation(language: Language, topic: string, difficulty: number, chapterIndex: number, lessonIndex: number): string {
  const explanations: Record<string, string[]> = {
    'Переменные': [
      'Когда вы создаете переменную, Python выделяет место в памяти для хранения значения.',
      'Переменная - это имя (идентификатор), которое ссылается на это место в памяти.',
      'При присваивании нового значения переменной, старое значение может быть удалено из памяти (если на него больше нет ссылок).'
    ],
    'Функции': [
      'При вызове функции Python создает новый стековый фрейм (frame) для выполнения кода функции.',
      'Параметры функции копируются в локальные переменные этого фрейма.',
      'После выполнения функции фрейм удаляется, а возвращаемое значение передается обратно в место вызова.'
    ],
    'Классы': [
      'Класс - это объект типа `type`, который содержит методы и атрибуты.',
      'При создании объекта (экземпляра класса) вызывается метод `__init__`, который инициализирует атрибуты.',
      'Каждый объект имеет свой собственный набор атрибутов, но методы общие для всех объектов класса.'
    ],
    'Циклы': [
      'Цикл `for` перебирает элементы итерируемого объекта (список, строка, range и т.д.).',
      'На каждой итерации переменная цикла получает следующее значение из последовательности.',
      'Цикл продолжается, пока не закончатся элементы или не встретится оператор `break`.'
    ]
  }
  
  const topicKey = Object.keys(explanations).find(k => topic.includes(k)) || 'общая тема'
  const explanation = explanations[topicKey] || [
    `${topic} работает следующим образом: код выполняется последовательно, каждая конструкция имеет свою роль и логику выполнения.`,
    `Понимание внутреннего механизма работы поможет вам эффективнее использовать эту концепцию в своих проектах.`,
    `Рекомендуется экспериментировать с кодом, изменяя параметры и наблюдая за результатами.`
  ]
  
  return explanation.join('\n\n')
}

// Генерация частых ошибок
function generateCommonMistakes(language: Language, topic: string, difficulty: number): string {
  const mistakes: Record<string, string[]> = {
    'Переменные': [
      '**Ошибка:** Использование переменной до её объявления. **Решение:** Всегда объявляйте переменные перед использованием.',
      '**Ошибка:** Путаница между `=` (присваивание) и `==` (сравнение). **Решение:** `=` - это присваивание, `==` - сравнение.',
      '**Ошибка:** Использование зарезервированных слов как имен переменных. **Решение:** Не используйте слова вроде `def`, `class`, `if` как имена.'
    ],
    'Функции': [
      '**Ошибка:** Забыли `return` в функции, которая должна возвращать значение. **Решение:** Всегда используйте `return` для возврата результата.',
      '**Ошибка:** Неправильный порядок параметров при вызове функции. **Решение:** Следите за порядком и типами параметров.',
      '**Ошибка:** Изменение изменяемых объектов (списков, словарей) внутри функции может изменить оригинал. **Решение:** Используйте копии: `list.copy()` или `list[:]`.'
    ],
    'Классы': [
      '**Ошибка:** Забыли `self` в методах класса. **Решение:** Первый параметр метода всегда должен быть `self` (в Python).',
      '**Ошибка:** Обращение к атрибуту класса через экземпляр, когда нужно через класс. **Решение:** Понимайте разницу между атрибутами класса и экземпляра.',
      '**Ошибка:** Не вызвали `super().__init__()` в дочернем классе. **Решение:** Всегда вызывайте конструктор родительского класса при наследовании.'
    ],
    'Циклы': [
      '**Ошибка:** Бесконечный цикл из-за неправильного условия. **Решение:** Убедитесь, что условие цикла когда-нибудь станет ложным.',
      '**Ошибка:** Изменение списка во время итерации по нему. **Решение:** Итерируйтесь по копии списка или используйте обратный порядок.',
      '**Ошибка:** Использование `break` вне цикла. **Решение:** `break` работает только внутри циклов.'
    ]
  }
  
  const topicKey = Object.keys(mistakes).find(k => topic.includes(k)) || 'общая тема'
  const mistakeList = mistakes[topicKey] || [
    '**Ошибка:** Неправильный синтаксис. **Решение:** Внимательно проверяйте скобки, кавычки и отступы.',
    '**Ошибка:** Неправильные типы данных. **Решение:** Убедитесь, что используете правильные типы для операций.',
    '**Ошибка:** Логические ошибки. **Решение:** Используйте отладку (debugging) для поиска ошибок в логике.'
  ]
  
  return mistakeList.join('\n\n')
}

// Экспорт тем для использования
export const TOPICS = {
  python: PYTHON_TOPICS,
  javascript: JAVASCRIPT_TOPICS,
  java: JAVA_TOPICS,
  cpp: CPP_TOPICS,
  csharp: CSHARP_TOPICS
}
