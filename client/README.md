# Hostel Management System - Frontend

A modern React-based hostel management system built with Vite, Tailwind CSS, and React Router.

## Features

- **Authentication System**: Secure login for admins and students
- **Admin Dashboard**: Complete management interface for hostels, rooms, and requests
- **Student Portal**: Dashboard for room requests and profile management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Clean, intuitive interface

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Material Icons**: Icon system

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hostel-management-frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── admin/          # Admin-specific components
│   └── student/        # Student-specific components
├── pages/              # Route components
├── services/           # API services and data fetching
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── utils/              # Helper functions and constants
└── styles/             # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.