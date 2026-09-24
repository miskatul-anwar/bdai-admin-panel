# BDAI Admin Panel

Administrative Content Management System for the **BDAI** (BanglaDesh Sectoral Knowledge Graphs and Large Language Models for Artificial Intelligence-Driven Insights) project.

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4** to match the technology and design language of [`bdai-web`](../bdai-web) and [https://bdai.bike-csecu.com/](https://bdai.bike-csecu.com/).

---

## 👥 Three User Types & Permissions

The admin panel supports multiple users across **3 distinct roles**:

| Feature / Action | Admin | Moderator | Member |
| :--- | :---: | :---: | :---: |
| **Manage Users & Role Assignment** (`/dashboard/users`) |  | ❌ | ❌ |
| **Delete Records** (Team, News, Tenders, Users) |  | ❌ | ❌ |
| **Publish & Edit News & Events** (`/dashboard/news`) |  |  | ❌ (Read-only) |
| **Post & Edit Vacancies & Tenders** (`/dashboard/vacancies`) |  |  | ❌ (Read-only) |
| **Add & Edit Team Members** (`/dashboard/team`) |  |  | ❌ (Read-only) |
| **Update Research Objectives** (`/dashboard/objectives`) |  |  | ❌ (Read-only) |
| **View Dashboard, Analytics & Research Catalog** |  |  |  |

### Preloaded Multi-User Accounts

- **Admins**:
  - `miskat@std.cu.ac.bd` (Miskatul Anwar)
  - `rudra@cu.ac.bd` (Prof. Dr. Rudra Pratap Deb Nath)
- **Moderators**:
  - `nowshed@cu.ac.bd` (Dr. Abu Nowshed Chy)
  - `mahbubcse@cu.ac.bd` (Dr. Md. Mahbubul Islam)
  - `shimacse@cu.ac.bd` (Shima Chakraborty)
- **Members**:
  - `nesarul@std.cu.ac.bd` (Md. Nesarul Haque)
  - `atikishrak66@gmail.com` (Atik Ishrak)
  - `mdkais3@gmail.com` (Md. Kais)
  - `minhaj@std.cu.ac.bd` (Minhajul Islam)

---

## 🚀 Features

- **Exact Design Match with https://bdai.bike-csecu.com/**:
  - Top fixed Navbar in **`#0c2461`** (Navy) with official logo and `BD<span className="text-[#60a5fa]">AI</span>` wordmark.
  - Light clean grey canvas background (**`#ecf0f1`**).
  - High-readability white cards (`bg-white rounded-2xl p-6 shadow-sm border border-gray-100`).
  - Hero with **40px subtle grid pattern** (`#07101f`).
  - Target Sector Ribbon in `bg-blue-500`.
- **User Management & Role Switching**:
  - Full CRUD in [`/dashboard/users`](/dashboard/users).
  - 1-click active profile switcher in the top navigation dropdown to quickly preview permissions as Admin, Moderator, or Member.
- **Port Isolation**: Configured to run on **Port 3001** (`http://localhost:3001`), allowing concurrent execution with `bdai-web` on port 3000.

---

## 🛠️ Getting Started

### 1. Install dependencies
```bash
cd /home/miskat/Projects/bdai/bdai_admin_panel
npm install
```

### 2. Start the development server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### 3. Quick 1-Click Login Testing
On `/login`, click:
- **Admin**: Log in as *Miskatul Anwar* (Full control)
- **Mod**: Log in as *Dr. Abu Nowshed Chy* (Content management)
- **Member**: Log in as *Md. Nesarul Haque* (Read-only / Contributor)
