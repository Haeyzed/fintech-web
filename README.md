# FinTech Platform Frontend

This project is the frontend of a FinTech platform designed to enable users to register, link bank accounts, manage transactions, and view their transaction history. It is built using **Next.js** with **React** and styled using **TailwindCSS**.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
4. [Running the Project](#running-the-project)
5. [Folder Structure](#folder-structure)
6. [Features](#features)
7. [User Flow](#user-flow)
8. [API Integration](#api-integration)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Additional Notes](#additional-notes)

---

## Project Overview
The FinTech Platform enables users to:
1. **Register and Log in**
2. **Link Bank Account or Payment Gateway**
3. **Deposit and Withdraw Funds**
4. **View Transaction History**

## Tech Stack
- **Frontend**: Next.js, React, TailwindCSS
- **Authentication**: OAuth 2.0, JWT
- **State Management**: Redux / Context API
- **Testing**: Jest

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or later)
- [pnpm](https://pnpm.io/)

### Installation
1. **Clone the repository**
   ```bash
   git clone git@github.com:Haeyzed/fintech-web.git
   cd fintech-web
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

### Environment Variables
Create a `.env.local` file in the root directory and add the following variables:
```
NEXT_PUBLIC_API_URL=your_api_url_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

## Running the Project
1. **Start the development server**
   ```bash
   pnpm dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Folder Structure
```
fintech-web/
├── components/
├── pages/
├── public/
├── styles/
├── lib/
├── hooks/
├── context/
├── types/
└── tests/
```

## Features
- User Authentication (Register, Login, Logout)
- Bank Account Management
- Transaction Processing (Deposits and Withdrawals)
- Transaction History
- User Profile Management

## User Flow

1. **Login**: User logs into their account

2. **Create Nigerian Bank Account**:
   - Navigate to the "Bank Accounts" section
   - Click on "Add New Account"
   - Fill in the following details:
      - Account Number
      - Select Bank from dropdown
      - Select Currency from dropdown
      - Select Account Type from dropdown
      - Check the "Primary Account" box if applicable
   - Click "Add Bank Account" to save

3. **Make a Deposit**:
   - Go to the "Transactions" section
   - Click on "Deposit"
   - Enter the deposit amount
   - Select Payment Method from dropdown
   - Select Bank Account from dropdown
   - Add an optional description
   - Click "Deposit" to confirm

4. **Perform a Withdrawal**:
   - Navigate to the "Transactions" or "Wallet" section
   - Click on "Withdraw"
   - Enter the withdrawal amount
   - Select Payment Method from dropdown
   - Select Bank Account from dropdown
   - Add an optional description
   - Enter the Reference Code (if required)
   - Click "Withdraw" to confirm

Note: Users can have multiple bank accounts assigned to their profile and can choose which account to use for deposits or withdrawals.

## API Integration
- Describe how the frontend integrates with your backend API
- Include any authentication methods used

## Testing
- Explain how to run tests
- Describe the testing strategy (unit tests, integration tests, etc.)

## Deployment
- Provide instructions for deploying the application

## Additional Notes
- Any other relevant information about the project
- Known issues or limitations
- Future improvements or features planned