# Sata Matka Gaming Platform

A full-featured gaming platform for Sata Matka with comprehensive role-based access control, multiple game types, and financial management.

## Features

- **Role-Based Access Control**: Admin, Subadmin, and Player roles with different permissions and dashboards
- **Market System**: Create, manage, and participate in various markets with different game types
- **Game Types**: Jodi, Hurf, Cross, and Odd-Even games with different payout ratios
- **Financial Management**: Wallet system with deposits, withdrawals, and transaction history
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Result Declaration**: Automatic bet processing and winner calculation
- **Reporting**: Comprehensive reporting for admins and subadmins

## Tech Stack

- React
- TypeScript
- Express
- PostgreSQL
- Drizzle ORM
- Tailwind CSS
- Shadcn UI

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express API
- `/shared` - Shared types and schemas used by both frontend and backend
- `/db-setup` - Database setup scripts and sample data

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. Install dependencies: `npm install`
2. Setup the database using the scripts in `/db-setup`
3. Start the development server: `npm run dev`

## Sample Users

| Username  | Password    | Role     | Wallet Balance |
|-----------|-------------|----------|---------------|
| admin     | admin123    | Admin    | 100,000       |
| subadmin1 | subadmin123 | Subadmin | 50,000        |
| player1   | player123   | Player   | 5,000         |

## Database Schema

The database schema includes:

- **Users**: Admin, Subadmin, and Player accounts
- **Markets**: Game categories with open/close times
- **Game Types**: Different game types with payout ratios
- **Market Games**: Junction table linking markets to available game types
- **Bets**: User bets on specific markets and game types
- **Transactions**: Financial transactions for user wallets

## Architecture

- **Frontend**: React with TanStack Query for data fetching
- **Backend**: Express API with Drizzle ORM for database access
- **Authentication**: Session-based authentication
- **State Management**: React Context with custom hooks
