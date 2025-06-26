# FeedbackFlow - Internal Team Feedback Tool

A modern web application for structured feedback sharing between managers and team members.

## Features

### Core Features
- **Authentication & Roles**: Manager and Employee roles with secure login
- **Feedback Submission**: Structured feedback with strengths, areas to improve, and sentiment
- **Feedback Visibility**: Role-based access control for feedback data
- **Dashboard**: Personalized dashboards for managers and employees
- **Feedback Management**: Edit, update, and acknowledge feedback

### Technical Stack
- **Frontend**: React 18 with TypeScript, Tailwind CSS, Lucide React icons
- **Backend**: Python Flask with SQLAlchemy ORM
- **Database**: SQLite for development
- **Authentication**: JWT tokens with bcrypt password hashing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd feedback-tool
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running the Application

1. **Start the Python backend**
   ```bash
   python app.py
   ```
   The API server will run on http://localhost:5000

2. **Start the React frontend** (in a new terminal)
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

### Demo Accounts

The application comes with pre-configured demo accounts:

**Manager Account:**
- Email: sarah.manager@company.com
- Password: password123

**Employee Accounts:**
- Email: john.smith@company.com
- Password: password123

- Email: emily.davis@company.com
- Password: password123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get users (filtered by role)

### Feedback
- `GET /api/feedback` - Get feedback (filtered by role)
- `POST /api/feedback` - Create new feedback (managers only)
- `PUT /api/feedback/:id` - Update feedback (managers only)
- `POST /api/feedback/:id/acknowledge` - Acknowledge feedback (employees only)

### Teams
- `GET /api/teams` - Get teams

## Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `name`: Full name
- `password_hash`: Bcrypt hashed password
- `role`: 'manager' or 'employee'
- `team_id`: Team identifier
- `manager_id`: Manager's user ID (for employees)

### Feedback Table
- `id`: Primary key
- `manager_id`: Manager who gave feedback
- `employee_id`: Employee who received feedback
- `strengths`: Positive feedback text
- `areas_to_improve`: Improvement suggestions
- `sentiment`: 'positive', 'neutral', or 'negative'
- `acknowledged`: Boolean acknowledgment status
- `acknowledged_at`: Timestamp of acknowledgment
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Teams Table
- `id`: Primary key
- `name`: Team name
- `manager_id`: Team manager's user ID

## Development

### Project Structure
```
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── src/
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer
│   └── types/           # TypeScript type definitions
├── package.json         # Node.js dependencies
└── README.md           # This file
```

### Key Components
- **AuthContext**: Manages user authentication state
- **ApiService**: Handles all API communications
- **Custom Hooks**: useUsers, useFeedback for data fetching
- **Role-based Routing**: Different views for managers and employees

## Security Features

- JWT token-based authentication
- Bcrypt password hashing
- Role-based access control
- CORS protection
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.