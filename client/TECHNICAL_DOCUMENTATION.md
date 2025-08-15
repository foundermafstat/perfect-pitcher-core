# Perfect Pitcher - Техническая документация клиентской части

## Обзор архитектуры

Perfect Pitcher - это веб-приложение для создания презентаций и управления проектами, построенное на современном стеке технологий:

- **Frontend**: Next.js 15 с React 19 и TypeScript
- **UI Framework**: Tailwind CSS v4 + shadcn/ui компоненты
- **База данных**: PostgreSQL с Prisma ORM
- **Аутентификация**: NextAuth.js v5
- **Web3**: Wagmi + RainbowKit для интеграции с кошельками
- **Styling**: Tailwind CSS v4 с поддержкой анимаций
- **Валидация**: Zod для схем данных

## Структура проекта

### Основные директории

```
client/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (app)/             # Главная группа маршрутов
│   │   ├── (auth)/            # Маршруты аутентификации
│   │   ├── (examples)/        # Примеры интерфейсов
│   │   ├── (view)/            # Просмотр контента
│   │   └── api/               # API роуты
│   ├── components/            # React компоненты
│   ├── lib/                   # Утилиты и конфигурация
│   ├── hooks/                 # Кастомные React хуки
│   ├── providers/             # Context провайдеры
│   └── types.ts               # TypeScript типы
├── prisma/                    # База данных и миграции
├── public/                    # Статические файлы
└── registry/                  # shadcn/ui компоненты
```

## Конфигурация и настройки

### Package.json ключевые особенности
- **Runtime**: Node.js с поддержкой ES модулей
- **Сборка**: Next.js с Turbopack в dev режиме
- **Пакетный менеджер**: pnpm
- **Линтинг**: ESLint + Prettier с автосортировкой импортов

### Next.js конфигурация
```typescript
// next.config.ts
{
  experimental: {
    serverActions: { bodySizeLimit: "10mb" }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
}
```

### Переменные окружения
Обязательные переменные (в `env.mjs`):
- `DATABASE_URL` - строка подключения к PostgreSQL
- `AUTH_SECRET` - секрет для NextAuth
- `OPENAI_API_KEY` - ключ OpenAI API
- `GOOGLE_ID`, `GOOGLE_SECRET` - OAuth Google
- `GITHUB_ID`, `GITHUB_SECRET` - OAuth GitHub
- `RESEND_*` - настройки почтового сервиса

## Система маршрутизации

### App Router структура

#### Основные группы маршрутов:
1. **`(app)/`** - Основное приложение с сайдбаром и навигацией
   - `/` - Главная страница
   - `/projects` - Управление проектами
   - `/stories` - Презентации
   - `/agent` - AI-агент чат

2. **`(auth)/`** - Аутентификация без навигации
   - `/signin` - Вход в систему
   - `/signup` - Регистрация

3. **`(examples)/`** - Демо интерфейсы
   - `/dashboard` - Пример дашборда

### Layout структура
```typescript
// Корневой layout с провайдерами
RootLayout
├── WagmiClientProvider       // Web3 кошельки
├── ThemeProvider            // Темы
├── NextAuthProvider         // Аутентификация
├── ActiveThemeProvider      // Активная тема
├── TranslationsProvider     // Интернационализация
├── StoryProvider           // Управление презентациями
├── AgentSidebarProvider    // AI-агент сайдбар
└── SidebarProvider         // Главный сайдбар
```

## База данных

### Prisma схема - основные модели:

#### Пользователи и аутентификация
- **User** - пользователи с поддержкой Web3 кошельков
- **Account** - OAuth аккаунты
- **Session** - пользовательские сессии

#### Основной контент
- **Project** - проекты пользователей с AI-генерацией
- **Story** - презентации со слайдами
- **Slide** - слайды презентаций
- **Element** - элементы на слайдах

#### Платежи и токены
- **Payment** - Stripe платежи
- **TokenTransaction** - транзакции внутренних токенов
- **FiatTransaction** - фиатные транзакции

#### AI-агент
- **AgentSession** - сессии AI-агента
- **AgentEvent** - события в сессиях

#### Задачи
- **Task** - система задач пользователей

### Ключевые особенности:
- PostgreSQL с поддержкой JSON полей
- Cascade удаление связанных записей
- Индексы для производительности
- Enum типы для статусов

## Система аутентификации

### NextAuth.js v5 конфигурация

#### Провайдеры:
1. **Google OAuth** - через Google Identity
2. **GitHub OAuth** - через GitHub Apps
3. **Credentials** - email/password с bcrypt

#### Особенности:
- JWT стратегия сессий (30 дней)
- Автоматическое связывание аккаунтов
- Поддержка Web3 кошельков в профиле
- Проверка email верификации

#### Callbacks:
```typescript
// Гидратация токена с данными пользователя
jwt({ token, user }) {
  // Загрузка walletAddress, tokenBalance из БД
}

// Расширение сессии
session({ session, token }) {
  // Добавление role, walletAddress, tokenBalance
}
```

## API маршруты

### Основные endpoint'ы:

#### `/api/projects`
- `GET` - список проектов пользователя
- `POST` - создание нового проекта с AI-генерацией

#### `/api/stories`
- `GET` - список презентаций
- `POST` - создание презентации

#### `/api/agent/chat`
- `POST` - чат с AI-агентом (OpenAI GPT-4)
- Поддержка функций: навигация, управление временем, анализ файлов

#### `/api/session`
- `POST` - создание OpenAI Realtime сессии для голосового чата

#### Аутентификация
- `/api/auth/[...nextauth]` - NextAuth endpoints

### Особенности API:
- Автоматическая авторизация через `auth()` helper
- Zod валидация входных данных
- Обработка ошибок с HTTP статусами
- TypeScript типизация

## Компоненты и UI

### shadcn/ui система
- **Стиль**: New York вариант
- **Тема**: Neutral базовый цвет
- **Иконки**: Lucide React
- **CSS переменные**: Поддержка динамических тем

### Ключевые компоненты:

#### Навигация
- `AppSidebar` - главный сайдбар приложения
- `Header` - шапка с пользовательским меню
- `Navigation` - основная навигация

#### Формы
- React Hook Form + Zod валидация
- Автогенерация из shadcn/ui

#### AI-агент
- `AgentSidebarSlot` - правая панель с чатом
- `AgentBroadcastPanel` - панель голосового чата
- WebSocket подключение для real-time

### Система тем
- Tailwind CSS v4 с CSS переменными
- Поддержка светлой/темной темы
- Кастомные цветовые схемы
- Сохранение в cookies

## Интеграции

### OpenAI
- **GPT-4** для текстового чата
- **Realtime API** для голосового взаимодействия
- Система функций (tools) для навигации
- Анализ изображений и файлов

### Web3
- **Wagmi v2** - React хуки для Ethereum
- **RainbowKit** - подключение кошельков
- Сохранение адреса кошелька в профиле
- Интеграция с внутренней токен системой

### Платежи
- **Stripe** - обработка платежей
- Webhook'и для обновления статусов
- Связка с внутренними токенами

### Email
- **Resend** - отправка писем
- React Email для шаблонов
- Magic link аутентификация

## Производительность и оптимизация

### Next.js оптимизации
- App Router для улучшенной производительности
- Server Components по умолчанию
- Automatic Static Optimization
- Image Optimization для внешних изображений

### Сборка
- **Turbopack** в dev режиме (в 5x быстрее)
- Tree shaking для уменьшения bundle
- Code splitting автоматически

### Кэширование
- Server Component кэширование
- SWR для клиентских данных
- Prisma connection pooling

## Безопасность

### Аутентификация
- NextAuth.js с проверенными провайдерами
- CSRF защита встроена
- JWT подписание секретным ключом

### API
- Middleware для проверки сессий
- Валидация всех входных данных
- Rate limiting (рекомендуется добавить)

### База данных
- Parameterized queries через Prisma
- Row Level Security (PostgreSQL)
- Cascade удаление для очистки данных

## Мониторинг и аналитика

### Встроенные решения
- Vercel Analytics для производительности
- Console логирование в development
- Error boundaries для React ошибок

### Рекомендации
- Sentry для error tracking
- PostHog для user analytics
- Uptime monitoring

## Развертывание

### Production готовность
- TypeScript проверки
- ESLint + Prettier для качества кода
- Prisma миграции для схемы БД
- Environment validation через Zod

### Переменные окружения
Все необходимые переменные определены в `env.mjs` с валидацией типов.

### База данных
- PostgreSQL с поддержкой JSON
- Автоматические миграции через Prisma
- Seed данные для начальной настройки

## Интернационализация

### next-intl
- Поддержка множественных языков
- Динамическое переключение локали
- Сохранение предпочтений пользователя
- Серверный и клиентский рендеринг

### Поддерживаемые языки
- Английский (по умолчанию)
- Русский
- Испанский
- Французский
- Немецкий
- Китайский
- Японский

## Заключение

Perfect Pitcher представляет собой современное полнофункциональное веб-приложение с передовыми технологиями:

- **Современный стек**: Next.js 15, React 19, TypeScript
- **Безопасность**: NextAuth.js, Prisma, Zod валидация
- **UI/UX**: Tailwind CSS v4, shadcn/ui, анимации
- **AI интеграция**: OpenAI GPT-4, Realtime API
- **Web3**: Поддержка кошельков, токены
- **Масштабируемость**: Микросервисная архитектура, API-first подход

Приложение готово к production развертыванию и дальнейшему масштабированию.
