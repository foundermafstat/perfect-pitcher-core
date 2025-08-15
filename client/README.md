# Perfect Pitcher - Client Application

A modern web application for creating presentations and managing projects with AI integration, built on cutting-edge technologies.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **UI Framework**: Tailwind CSS v4 + shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Web3**: Wagmi + RainbowKit for wallet integration
- **AI Integration**: OpenAI GPT-4 + Realtime API
- **Styling**: Tailwind CSS v4 with animations
- **Validation**: Zod for data schemas

## ✨ Features

- 🎯 **AI Agent** with voice and text chat capabilities
- 🌐 **Web3 Integration** with wallet support and token system
- 💳 **Payment Processing** via Stripe integration
- 🌍 **Internationalization** support for 7 languages
- 🎨 **Modern UI** with customizable themes and animations
- 📱 **Responsive Design** with mobile support
- 🔐 **Secure Authentication** with multiple OAuth providers
- 📊 **Project Management** with AI-powered generation
- 🎪 **Presentation Builder** with slide editor

## 🏗️ Project Structure

```
client/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (app)/             # Main application routes
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (examples)/        # UI examples
│   │   ├── (view)/            # Content viewing
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities and configuration
│   ├── hooks/                 # Custom React hooks
│   ├── providers/             # Context providers
│   └── types.ts               # TypeScript types
├── prisma/                    # Database and migrations
├── public/                    # Static files
└── registry/                  # shadcn/ui components
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd perfect-pitcher-core/client
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in the required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret key
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_ID`, `GOOGLE_SECRET` - Google OAuth credentials
- `GITHUB_ID`, `GITHUB_SECRET` - GitHub OAuth credentials
- `RESEND_*` - Email service configuration

4. Set up the database:
```bash
pnpm db:push
pnpm db:generate
```

5. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📖 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format:write` - Format code with Prettier
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:reset` - Reset database

## 🗄️ Database Schema

### Core Models

- **User** - Users with Web3 wallet support
- **Project** - User projects with AI generation
- **Story** - Presentations with slides
- **Slide** - Individual presentation slides
- **Element** - Elements within slides
- **Payment** - Stripe payment records
- **TokenTransaction** - Internal token transactions
- **AgentSession** - AI agent chat sessions

## 🔐 Authentication

The application supports multiple authentication methods:

- **Google OAuth** - Sign in with Google
- **GitHub OAuth** - Sign in with GitHub  
- **Email/Password** - Traditional credentials
- **Magic Link** - Passwordless email authentication

## 🌐 API Routes

### Main Endpoints

- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/stories` - List presentations
- `POST /api/stories` - Create presentation
- `POST /api/agent/chat` - Chat with AI agent
- `POST /api/session` - Create OpenAI Realtime session

## 🎨 UI Components

Built with **shadcn/ui** component system:

- **Style**: New York variant
- **Theme**: Neutral base color with CSS variables
- **Icons**: Lucide React
- **Responsive**: Mobile-first design
- **Accessible**: ARIA compliant components

### Key Features

- Dark/Light theme support
- Custom color schemes
- Smooth animations
- Touch-friendly mobile interface

## 🤖 AI Integration

### OpenAI Features

- **GPT-4** for text-based conversations
- **Realtime API** for voice interactions
- **Function calling** for navigation and app control
- **Image analysis** for uploaded files
- **Context awareness** for project-specific assistance

### Agent Capabilities

- Navigate through application pages
- Create and manage projects
- Analyze uploaded files and images
- Provide real-time assistance
- Voice and text interaction modes

## 🌍 Internationalization

Supported languages:
- English (default)
- Russian
- Spanish
- French
- German
- Chinese
- Japanese

Dynamic locale switching with preference persistence.

## 🔌 Web3 Integration

- **Wallet Connection**: RainbowKit for multiple wallet support
- **Token System**: Internal token management
- **Balance Tracking**: Real-time balance updates
- **Transaction History**: Complete transaction logs

## 💰 Payment System

- **Stripe Integration**: Secure payment processing
- **Webhook Handling**: Automated status updates
- **Token Rewards**: Automatic token allocation
- **Subscription Support**: Recurring payment capabilities

## 🚀 Performance

### Optimizations

- **App Router**: Next.js 13+ for improved performance
- **Server Components**: Reduced client-side JavaScript
- **Turbopack**: 5x faster development builds
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic bundle splitting

### Caching

- Server Component caching
- SWR for client-side data
- Prisma connection pooling
- Static asset optimization

## 🔒 Security

- **NextAuth.js**: Secure authentication flows
- **CSRF Protection**: Built-in protection
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma parameterized queries
- **Environment Validation**: Type-safe environment variables

## 📊 Monitoring

### Built-in

- Vercel Analytics for performance monitoring
- Development console logging
- React Error Boundaries

### Recommended

- Sentry for error tracking
- PostHog for user analytics
- Uptime monitoring services

## 🚀 Deployment

### Production Ready

- TypeScript type checking
- ESLint + Prettier code quality
- Prisma database migrations
- Environment variable validation
- Build optimization

### Environment Setup

All required environment variables are defined in `env.mjs` with type validation.

### Database

- PostgreSQL with JSON field support
- Automatic migrations via Prisma
- Seed data for initial setup

## 📝 Documentation

For detailed technical documentation, see [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing discussions

---

**Perfect Pitcher** - Where AI meets presentation excellence! 🎯✨