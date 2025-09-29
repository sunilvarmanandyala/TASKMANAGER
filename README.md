
<img width="1188" height="643" alt="Screenshot 2025-09-28 at 8 02 05 am" src="https://github.com/user-attachments/assets/0ac4e1a9-99d4-4305-8161-b01b18686f43" />


```markdown
# TaskManager — Full-Stack App (.NET Web API + React + Tailwind)

A clean, full-stack **Task Manager** with a **C#/.NET Web API** backend and a **React (Create React App) + Tailwind CSS** frontend.  
Create, update, complete, and delete tasks via a responsive UI backed by a REST API using **Entity Framework Core** with **SQL Server/Azure SQL** (or **SQLite** for local dev).

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Run Locally](#run-locally)
- [API Endpoints](#api-endpoints)
- [EF Core & Migrations](#ef-core--migrations)
- [CORS (Dev)](#cors-dev)
- [Tailwind Notes](#tailwind-notes)
- [Testing](#testing)
- [Docker (Optional)](#docker-optional)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features
- ✅ CRUD tasks (title, completed flag, timestamps)
- 🔎 Filter by status (All / Active / Completed)
- 📱 Responsive UI (Tailwind)
- 🧩 Clean REST API (EF Core)
- 🧪 Local dev for backend & frontend; deploy independently

---

## Tech Stack
- **Backend:** .NET 8 Web API (C#), Entity Framework Core, (optional) Swagger
- **Database:** SQL Server / Azure SQL (recommended) or SQLite (dev)
- **Frontend:** React (Create React App), Tailwind CSS, PostCSS
- **Tooling:** Node 18+, npm, .NET 8 SDK

---

## Project Structure
```

<repo-root>/
├─ backend/                # .NET Web API (C#)
│  ├─ Controllers/         # e.g., TasksController.cs
│  ├─ Models/              # e.g., TaskItem.cs
│  ├─ Data/                # AppDbContext, seeding/helpers
│  ├─ Migrations/          # EF Core migrations
│  ├─ appsettings.json     # Connection strings & config
│  ├─ Program.cs           # Hosting, DI, CORS, Swagger
│  └─ TaskManager.Api.csproj
├─ public/
├─ src/                    # React (CRA) source
│  ├─ App.js
│  ├─ index.js
│  ├─ components/          # Forms, Lists, Filters, etc.
│  └─ pages/               # Screens (Home, Tasks)
├─ package.json            # CRA scripts
├─ tailwind.config.js
├─ postcss.config.js
└─ README.md

````

> If your `/backend` folder is empty, create it with `dotnet new webapi -o backend` and add the folders/files as shown.

---

## Prerequisites
- **Node.js** 18+ and **npm**
- **.NET SDK** 8.0+
- **Database**
  - Local: SQL Server (Developer/Express) or SQLite
  - Cloud: Azure SQL (provide full connection string)

---

## Configuration

### Backend — `backend/appsettings.json` (examples)

**SQL Server / Azure SQL**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskManagerDb;Trusted_Connection=True;TrustServerCertificate=True"

    // Azure SQL example:
    // "DefaultConnection": "Server=tcp:<your-server>.database.windows.net,1433;Initial Catalog=TaskManagerDb;Persist Security Info=False;User ID=<user>;Password=<pwd>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  },
  "AllowedHosts": "*"
}
````

**SQLite (dev)**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=taskmanager.db"
  },
  "AllowedHosts": "*"
}
```

### Frontend — `.env` at repo root

```bash
REACT_APP_API_BASE=http://localhost:5001
```

CRA exposes `process.env.REACT_APP_*` variables to the browser build.

---

## Run Locally

### 1) Backend (API)

```bash
cd backend
dotnet restore
dotnet ef database update    # applies migrations (creates DB if needed)
dotnet run                   # http://localhost:5000 and https://localhost:5001
```

* If Swagger is enabled, test endpoints at `https://localhost:5001/swagger`.

### 2) Frontend (CRA + Tailwind)

```bash
# from repo root
npm install
npm start
```

* Opens `http://localhost:3000`
* The app calls the API at `REACT_APP_API_BASE`

> **Tip (single command dev):** add `concurrently` in the root `package.json` to start both servers together.

---

## API Endpoints

> Recommended contract (adjust to your actual controller routes).

* **GET** `/api/tasks` — list tasks

  ```json
  [
    { "id": 1, "title": "Buy milk", "completed": false, "createdAt": "2025-09-01T10:00:00Z" }
  ]
  ```

* **GET** `/api/tasks/{id}` — get one task

* **POST** `/api/tasks` — create task

  ```json
  { "title": "New task" }
  ```

* **PUT** `/api/tasks/{id}` — update task

  ```json
  { "id": 1, "title": "Updated title", "completed": false }
  ```

* **PATCH** `/api/tasks/{id}/complete` — toggle completion

  ```json
  { "id": 1, "completed": true }
  ```

* **DELETE** `/api/tasks/{id}` — delete task

**Entity shape (example)**

```json
{
  "id": 1,
  "title": "Buy milk",
  "completed": false,
  "createdAt": "2025-09-01T10:00:00Z",
  "updatedAt": "2025-09-01T10:30:00Z"
}
```

---

## EF Core & Migrations

Create/update your database schema:

```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

Typical files:

* `Models/TaskItem.cs` — entity with `Id`, `Title`, `Completed`, `CreatedAt`, `UpdatedAt`
* `Data/AppDbContext.cs` — `DbSet<TaskItem>` and configuration
* `Migrations/` — auto-generated migration classes

---

## CORS (Dev)

Allow the CRA origin during development (in `Program.cs`):

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(p => p
        .WithOrigins("http://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(); // enable CORS before MapControllers
app.MapControllers();

app.Run();
```

---

## Tailwind Notes

* Tailwind config lives in `tailwind.config.js`; ensure `content` includes CRA paths:

```js
content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"]
```

* Utility classes are used throughout (`flex`, `grid`, `px-4`, `bg-*`, etc.)

---

## Testing

* **Frontend:** CRA includes Jest + React Testing Library

  ```bash
  npm test
  ```
* **Backend:** add xUnit tests, FluentAssertions, and integration tests as needed

---

## Docker (Optional)

**Backend (API) — Dockerfile**

```dockerfile
# build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

# runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskManager.Api.dll"]   # replace with your API dll
```

**Frontend (CRA) — Dockerfile**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Deployment

**API**

* Azure App Service / Render / Fly.io / containers
* Configure `ConnectionStrings__DefaultConnection` (env var) in your host

**Frontend**

* Netlify / Vercel / GitHub Pages / Azure Static Web Apps
* Set `REACT_APP_API_BASE` to your public API URL in host env

---

## Troubleshooting

* **CORS errors:** ensure origin `http://localhost:3000` is allowed; `app.UseCors()` is enabled
* **404/Network errors:** check `REACT_APP_API_BASE` and routes match the backend
* **Migrations fail:** verify connection string & DB perms; for Azure SQL open firewall & use correct credentials
* **Tailwind not applying:** restart `npm start`; verify `tailwind.config.js` `content` paths

---

## License

MIT (recommended). Add a `LICENSE` file if you want explicit terms.

```
```

