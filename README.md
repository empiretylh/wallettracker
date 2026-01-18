# wallettracker
You are a senior full-stack software architect and Django expert.

I want to build a production-ready **Shared Wallet & Expense Tracker Web Application**
with a **Django + Django REST Framework backend** and a **React web frontend**.

The system must support:
- Personal wallets
- Shared wallets between partners or groups
- Multiple users contributing expenses and income
- Role-based permissions

==============================
BACKEND REQUIREMENTS (DJANGO)
==============================

Use:
- Python 3.x
- Django
- Django REST Framework
- JWT authentication
- PostgreSQL (SQLite acceptable for development)

1. Authentication
- User registration
- Login / logout
- JWT token authentication
- Secure password hashing

2. Core Models
Design models with proper relationships, constraints, and indexes:

User
- id
- username
- email

Wallet
- id
- name
- owner (User)
- is_shared (Boolean)
- created_at

WalletMember
- wallet (FK)
- user (FK)
- role (OWNER, CONTRIBUTOR, VIEWER)
- unique constraint (wallet + user)

Transaction
- id
- wallet (FK)
- created_by (User)
- type (INCOME or EXPENSE)
- category
- amount (Decimal)
- note
- date
- created_at

3. Permissions
- Only wallet members can view a wallet
- OWNER:
  - manage wallet members
  - delete wallet
- CONTRIBUTOR:
  - add/edit their own transactions
- VIEWER:
  - read-only access

4. API Endpoints (REST)
- Auth:
  - POST /api/auth/register
  - POST /api/auth/login
- Wallet:
  - POST /api/wallets/
  - GET /api/wallets/
  - GET /api/wallets/{id}/
  - POST /api/wallets/{id}/invite/
- Transactions:
  - POST /api/transactions/
  - GET /api/transactions/?wallet_id=
  - PUT /api/transactions/{id}/
  - DELETE /api/transactions/{id}/
- Reports:
  - GET /api/reports/summary/?wallet_id=&month=&year=

5. Business Logic
- Auto-add wallet owner as OWNER in WalletMember
- Prevent non-members from accessing wallet data
- Calculate wallet balance dynamically
- Monthly and category-wise summaries

6. Best Practices
- Use serializers
- Use ViewSets where appropriate
- Custom permission classes
- Clean, modular app structure
- Include example API responses

==============================
FRONTEND REQUIREMENTS (REACT)
==============================

Use:
- React
- Axios
- React Router
- Functional components + hooks

Pages:
- Login / Register
- Dashboard (wallet list)
- Wallet Detail (transactions list)
- Add/Edit Transaction
- Reports page

UI Requirements:
- Clean, minimal UI
- Responsive layout
- Forms with validation
- Protected routes (auth guard)

State Management:
- Context API or simple local state (no Redux)

==============================
DELIVERABLES
==============================

1. Django project structure
2. Django models
3. Serializers
4. API views / viewsets
5. Permissions
6. React folder structure
7. Example React components
8. Sample API requests & responses
9. Setup and run instructions

IMPORTANT:
- Code must be production-quality
- Follow clean architecture principles
- Explain key decisions briefly
- Do NOT omit permissions or security checks

Start by generating the **Django backend**, then the **React frontend**.
