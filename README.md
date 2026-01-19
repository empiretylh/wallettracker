# Wallet Tracker - Shared Wallet & Expense Tracker

A production-ready full-stack web application for managing personal and shared wallets with expense tracking capabilities.

## Features

- 👤 User authentication (JWT-based)
- 💰 Personal and shared wallets
- 📊 Income and expense tracking
- 👥 Role-based permissions (Owner, Contributor, Viewer)
- 📈 Financial reports with category breakdowns
- 🔒 Secure API endpoints
- 📱 Responsive design

## Tech Stack

### Backend
- Django 5.1.14
- Django REST Framework 3.14.0
- Simple JWT for authentication
- PostgreSQL / SQLite
- CORS headers for frontend integration

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- Context API for state management

## Project Structure

```
wallettracker/
├── config/                    # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── accounts/              # User authentication
│   │   ├── models.py         # Custom User model
│   │   ├── serializers.py
│   │   └── views.py
│   └── wallets/              # Wallet & transactions
│       ├── models.py         # Wallet, WalletMember, Transaction
│       ├── serializers.py
│       ├── views.py
│       ├── permissions.py
│       └── signals.py
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth context
│   │   ├── services/        # API services
│   │   └── App.jsx
│   └── package.json
├── requirements.txt
└── manage.py
```

## Setup Instructions

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd wallettracker
```

2. **Create virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment configuration**
```bash
cp .env.example .env
# Edit .env with your settings
```

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Create superuser (optional)**
```bash
python manage.py createsuperuser
```

7. **Run development server**
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment configuration**
```bash
cp .env.example .env
# Edit .env if needed (default: http://localhost:8000/api)
```

4. **Run development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/token/refresh/` - Refresh access token

### Wallets
- `GET /api/wallets/` - List user's wallets
- `POST /api/wallets/` - Create wallet
- `GET /api/wallets/{id}/` - Get wallet details
- `PUT /api/wallets/{id}/` - Update wallet (owner only)
- `DELETE /api/wallets/{id}/` - Delete wallet (owner only)
- `POST /api/wallets/{id}/invite/` - Invite user to wallet

### Transactions
- `GET /api/transactions/?wallet_id={id}` - List wallet transactions
- `POST /api/transactions/` - Create transaction
- `GET /api/transactions/{id}/` - Get transaction details
- `PUT /api/transactions/{id}/` - Update transaction
- `DELETE /api/transactions/{id}/` - Delete transaction

### Reports
- `GET /api/reports/summary/?wallet_id={id}&month={m}&year={y}` - Financial summary

## API Examples

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com"
  },
  "message": "User registered successfully"
}
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Create Wallet
```bash
curl -X POST http://localhost:8000/api/wallets/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "Family Budget",
    "is_shared": true
  }'
```

**Response:**
```json
{
  "id": 1,
  "name": "Family Budget",
  "owner": {
    "id": 1,
    "username": "john",
    "email": "john@example.com"
  },
  "is_shared": true,
  "balance": "0.00",
  "members": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "john",
        "email": "john@example.com"
      },
      "role": "OWNER",
      "created_at": "2024-01-18T19:54:42.275Z"
    }
  ],
  "created_at": "2024-01-18T19:54:42.275Z"
}
```

### Create Transaction
```bash
curl -X POST http://localhost:8000/api/transactions/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "wallet": 1,
    "type": "EXPENSE",
    "category": "Groceries",
    "amount": "150.50",
    "note": "Weekly shopping",
    "date": "2024-01-18"
  }'
```

**Response:**
```json
{
  "id": 1,
  "wallet": 1,
  "created_by": {
    "id": 1,
    "username": "john",
    "email": "john@example.com"
  },
  "type": "EXPENSE",
  "category": "Groceries",
  "amount": "150.50",
  "note": "Weekly shopping",
  "date": "2024-01-18",
  "created_at": "2024-01-18T20:00:00.000Z"
}
```

### Get Report Summary
```bash
curl -X GET "http://localhost:8000/api/reports/summary/?wallet_id=1&month=1&year=2024" \
  -H "Authorization: Bearer <access_token>"
```

**Response:**
```json
{
  "wallet_id": "1",
  "period": {
    "month": "1",
    "year": "2024"
  },
  "totals": {
    "income": "5000.00",
    "expense": "2350.75",
    "balance": "2649.25"
  },
  "by_category": [
    {
      "type": "INCOME",
      "category": "Salary",
      "total": "5000.00",
      "count": 1
    },
    {
      "type": "EXPENSE",
      "category": "Groceries",
      "total": "850.50",
      "count": 4
    },
    {
      "type": "EXPENSE",
      "category": "Utilities",
      "total": "250.25",
      "count": 3
    }
  ]
}
```

## Database Models

### User (Custom)
- Extends Django's AbstractUser
- Email field is unique and required

### Wallet
- `name` - Wallet name
- `owner` - Foreign key to User
- `is_shared` - Boolean flag
- `balance` - Computed property (income - expenses)
- Auto-creates OWNER membership on creation

### WalletMember
- `wallet` - Foreign key to Wallet
- `user` - Foreign key to User
- `role` - OWNER, CONTRIBUTOR, or VIEWER
- Unique constraint on (wallet, user)

### Transaction
- `wallet` - Foreign key to Wallet
- `created_by` - Foreign key to User
- `type` - INCOME or EXPENSE
- `category` - Transaction category
- `amount` - Decimal field
- `note` - Text field (optional)
- `date` - Date field

## Permissions

### Wallet Permissions
- **OWNER**: Full control (manage members, delete wallet, all transactions)
- **CONTRIBUTOR**: Can add/edit own transactions
- **VIEWER**: Read-only access

### Transaction Permissions
- Creator can edit/delete their own transactions
- Wallet owner can edit/delete any transaction in the wallet
- Only wallet members can view transactions

## Production Deployment

### PostgreSQL Configuration
Update `.env` file:
```
DB_ENGINE=django.db.backends.postgresql
DB_NAME=wallettracker
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

### Security Settings
```
SECRET_KEY=<generate-secure-key>
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Collect Static Files
```bash
python manage.py collectstatic
```

### Use Production Server
- Gunicorn for Django
- Nginx for reverse proxy
- Configure SSL/TLS certificates

## Development Notes

- Default SQLite database for development
- CORS enabled for localhost:5173 and localhost:3000
- JWT tokens: 60min access, 7 days refresh
- Automatic token refresh on frontend
- Form validation on both frontend and backend
- Responsive design for mobile/tablet/desktop

## License

This project is open source and available under the MIT License.

