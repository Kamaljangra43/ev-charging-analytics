# EV Charger Dashboard - Full Stack Application

A comprehensive EV charging analytics dashboard built with React frontend and Express.js backend.

## Features

- 📊 Interactive charts (Bar, Line, Area)
- 📱 Responsive design
- 🔄 Real-time data updates
- 📈 Daily and weekly views
- 💡 Hover interactions and tooltips
- 🎨 Clean eco-friendly design
- 🚀 RESTful API backend
- ⚡ Fast and optimized

## Tech Stack

### Frontend

- React 18
- Recharts for data visualization
- Lucide React for icons
- Axios for API calls
- CSS3 with custom eco-friendly design

### Backend

- Node.js
- Express.js
- CORS enabled
- Helmet for security
- Morgan for logging
- Environment configuration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   \`\`\`bash
   git clone (https://github.com/Kamaljangra43/ev-charging-analytics.git)
   cd ev-charger-fullstack
   \`\`\`

2. Install all dependencies
   \`\`\`bash
   npm run install-all
   \`\`\`

3. Start the development servers
   \`\`\`bash
   npm run dev
   \`\`\`

This will start:

- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Manual Setup

If you prefer to start servers manually:

1. Start the backend server:
   \`\`\`bash
   cd server
   npm install
   npm run dev
   \`\`\`

2. Start the frontend (in a new terminal):
   \`\`\`bash
   cd client
   npm install
   npm start
   \`\`\`

## API Endpoints

### Base URL: `http://localhost:5000/api`

- `GET /health` - Health check
- `GET /charging-data/daily` - Get daily charging data
- `GET /charging-data/weekly` - Get weekly charging data
- `GET /charging-data/summary/:view` - Get summary statistics (daily/weekly)
- `GET /charging-data/specific/:view/:identifier` - Get specific day/week data

## Project Structure

\`\`\`
ev-charger-fullstack/
├── client/ # React frontend
│ ├── public/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── services/ # API services
│ │ └── ...
│ └── package.json
├── server/ # Express backend
│ ├── index.js # Main server file
│ ├── .env # Environment variables
│ └── package.json
└── package.json # Root package.json
\`\`\`

## Environment Variables

Create a `.env` file in the `server` directory:

\`\`\`env
PORT=5000
NODE_ENV=development
\`\`\`

## Features

### Dashboard Functionality

- **Interactive Charts**: Bar, line, and area chart types
- **Data Views**: Switch between daily and weekly data
- **Hover Effects**: Real-time data display on hover
- **Summary Cards**: Key metrics with dynamic updates
- **Responsive Design**: Works on all device sizes
- **Error Handling**: Graceful error states and loading indicators

### API Features

- **RESTful Design**: Clean and intuitive API endpoints
- **Error Handling**: Comprehensive error responses
- **CORS Support**: Cross-origin requests enabled
- **Security**: Helmet.js for security headers
- **Logging**: Request logging with Morgan
- **Health Checks**: API status monitoring

## Customization

### Adding New Data Sources

1. Update the mock data in `server/index.js`
2. Add new API endpoints as needed
3. Update the frontend API service in `client/src/services/api.js`

### Styling

- Modify CSS variables in `client/src/index.css`
- Update component styles as needed
- Eco-friendly color palette is customizable

## Deployment

### Frontend (React)

\`\`\`bash
cd client
npm run build
\`\`\`

### Backend (Express)

\`\`\`bash
cd server
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
