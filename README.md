# GoodPoint Frontend

React frontend application for the GoodPoint educational platform.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

The app will run on `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Testing with Cypress

```bash
# Open Cypress interactive mode
npm run cy:open

# Run Cypress tests headless
npm run cy:run
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI** - Component library
- **React Query** - Data fetching and caching
- **Socket.io** - Real-time communication
- **Cypress** - E2E testing
- **Sass** - Styling

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page-level components
├── admin/         # Admin interface
├── common/        # Shared utilities and types
├── i18n/          # Internationalization
└── lib/           # Third-party library configs
```

## 🔧 Environment Variables

Create a `.env.local` file:

```bash
VITE_API_URL=http://localhost:8080
```

## 📱 Features

- Teacher dashboard for sending good points
- Real-time chat functionality
- Student management
- Multi-language support (Hebrew/English)
- PWA support
- Responsive design

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Build and Deploy Manually

```bash
npm run build
# Upload build/ folder to your hosting provider
```

## 📞 Support

For questions or issues, contact the development team.
