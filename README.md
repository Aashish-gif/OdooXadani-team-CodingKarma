# CodingKarma ERP/PLM System

CodingKarma is a comprehensive Product Lifecycle Management (PLM) and Enterprise Resource Planning (ERP) system designed to streamline manufacturing operations, product versioning, and engineering change management.

## 🚀 Key Features

-   **Product Management**: Comprehensive tracking of products, versions, and metadata.
-   **Bill of Materials (BoM)**: Detailed management of components and operations for product assembly.
-   **Engineering Change Orders (ECO)**: Formalized process for tracking and approving changes to products and BoMs.
-   **Dashboard & Analytics**: Real-time insights into manufacturing metrics and system activity.
-   **Role-Based Access Control (RBAC)**: Secure access management for different user roles.
-   **Notification System**: Integrated alerts for critical system events and ECO stages.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Radix UI, Framer Motion.
-   **Backend**: Next.js API Routes (RESTful), Prisma ORM.
-   **Database**: PostgreSQL.
-   **Authentication**: JWT-based authentication with bcrypt for password hashing.
-   **Charts**: Recharts for data visualization.

---

## 📊 System Architecture

### User Flow
The following diagram illustrates the typical user journey from login to managing products and ECOs.

```mermaid
graph TD
    A[User] -->|Login| B[Authentication]
    B -->|Success| C[Dashboard]
    C --> D[Product Management]
    C --> E[BoM Management]
    C --> F[ECO Tracking]
    
    D -->|Create/Update| G[Database]
    E -->|Define Components| G
    F -->|Request Change| H[Review Flow]
    H -->|Approve| I[New Product Version]
    I --> G
```

### Backend Architecture
CodingKarma follows a modern serverless-friendly architecture using Next.js API routes and Prisma.

```mermaid
graph LR
    subgraph Frontend
        V[Vite/Next.js UI]
        S[Server Actions/Fetch]
    end
    
    subgraph Backend
        R[API Routes]
        L[Lib/Middlewares]
        P[Prisma Client]
    end
    
    subgraph Data
        DB[(PostgreSQL)]
    end
    
    V --> S
    S -->|HTTP Requests| R
    R -->|Auth/Validation| L
    L --> R
    R --> P
    P --> DB
```

### Database Schema (ERD)
The system leverages a relational schema to maintain data integrity across products, components, and change orders.

```mermaid
erDiagram
    User ||--o{ UserActivity : performs
    User ||--o{ Notification : receives
    Product ||--o{ ProductVersion : has
    Product ||--o{ BoM : defines
    Product ||--o{ ECO : subject_to
    BoM ||--o{ BoMComponent : contains
    BoM ||--o{ BoMOperation : includes
    ECO ||--o{ ECOChange : specifies
    ECO ||--o{ ECOApproval : requires
    ECO ||--o{ ECOAuditLog : logs
```

---

## 🛠️ Getting Started

### Prerequisites
-   Node.js (latest LTS)
-   PostgreSQL Database

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/PARTH-JADAV20/OdooXadani-team-CodingKarma.git
    cd codingkarma
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root and add your database URL:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/codingkarma"
    JWT_SECRET="your-secret-key"
    ```

4.  **Database Migration**:
    ```bash
    npx prisma db push
    ```

5.  **Seed the Database** (Optional):
    ```bash
    npm run prisma:seed
    ```

6.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

---

## 📖 API Documentation

The system exposes a RESTful API under the `/api` directory. Key endpoint categories include:

-   `/api/auth`: Login, registration, and session management.
-   `/api/products`: CRUD operations for products and version history.
-   `/api/bom`: Management of Bill of Materials and components.
-   `/api/eco`: Engineering Change Order lifecycle management.
-   `/api/users`: Profile and system user management.

---

## 📄 License

This project is licensed under the MIT License.
