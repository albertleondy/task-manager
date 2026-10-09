# Mini Task Management Frontend Service

The React single-page frontend service for the Mini Task Management Application, built with **React 19**, **TypeScript**, **Vite**, **TanStack React Query v5**, **React Router v7**, and **Tailwind CSS / Shadcn UI components**.

---

## 1. Stack & Architecture

* **Framework:** React 19 with Function Components & Hooks
* **Routing:** **React Router v7** (`react-router-dom`) with code-splitting (`lazy()` + `Suspense`)
  * `/`: Main TaskFlow board & Kanban workspace
  * `/boards`: Redirects to `/`
  * `*`: Dedicated 404 `NotFound` fallback page
* **State & Data Fetching:** **TanStack React Query v5** (`useQuery` for cached reads, `useMutation` for writes with automatic query key invalidation)
* **Form Validation:** **Zod** schema validation for boards and tasks
* **Language:** TypeScript 5.7+
* **Build Tool:** Vite 6
* **Styling & UI:** Tailwind CSS v4 with Shadcn-style accessible UI primitives (`Button`, `Badge`, `Card`, `Modal`, `Input`, `Textarea`, `Select`, `Toast`)
* **Icons:** Lucide React
* **HTTP Client:** Axios (isolated in service layer with popup error interceptors)
* **Directory Structure:** Follows clean enterprise layout pattern:
  * `src/components/ui/`: Reusable accessible Shadcn UI primitives (`Button`, `Badge`, `Card`, `Modal`, `Input`, `Textarea`, `Select`, `Toast`)
  * `src/components/common/`: Confirmation modals, theme toggler, error banners, empty states, `PageMeta`
  * `src/layout/`: Clean `AppLayout` with `<Outlet />` support and sticky `AppHeader` with brand link
  * `src/components/Board/`: Board creation modal and board card components
  * `src/components/Task/`: Kanban columns, cards with direct status dropdowns, task modals
  * `src/lib/hooks/`: React Query custom hooks (`useGetBoards`, `useGetBoardById`, `useGetTasks`, `useCreateBoard`, `useCreateTask`, `useUpdateTask`, `useDeleteBoard`, `useDeleteTask`)
  * `src/lib/validations/`: Zod client-side schemas (`board.ts`, `task.ts`)
  * `src/lib/services/`: Modular domain service folders (`board/`, `task/`, `api/`) containing each domain's service functions and TypeScript DTOs/response types together
  * `src/context/`: Theme context provider (light / dark mode)
  * `src/pages/`:
    * `TaskManager.tsx`: Main board and Kanban task workspace
    * `NotFound.tsx`: Modern 404 page with navigation actions ("Go Back", "Back to Task Manager")

---

## 2. Prerequisites

* **Node.js:** v18.0.0+ (Tested on v20+ and v24+)
* **Package Manager:** `npm` (v9+) or `yarn`

---

## 3. Setup & Run Instructions (Clean Clone)

### Step 1: Navigate to the frontend directory
```bash
cd frontend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure Environment (Optional)
The frontend comes pre-configured with `.env.example` and `.env`:
```bash
# Default backend URL
VITE_API_BASE_URL=http://localhost:8000/api
```
If your backend is running on a different port or host, update `VITE_API_BASE_URL` in `.env`.

### Step 4: Run the Development Server
```bash
npm run dev
```
* The UI will be available at: **`http://localhost:5173`** (or configured port).

### Step 5: Build for Production
```bash
npm run build
```
This runs TypeScript checking (`tsc -b`) and bundles code-split static assets into `dist/`.

---

## 4. Features & Study Case Requirements Compliance

| Requirement | Implementation Detail |
|---|---|
| **R19. List & Create Boards** | Board list view with live task counters, search filter, and `CreateBoardModal`. |
| **R20. Readable Task Layout** | Board detail view organized in 3 clear Kanban columns (To Do, In Progress, Done) displaying title, description, status badge, and created timestamp. |
| **R21. Create Task with Validation** | `CreateTaskModal` validates non-empty title with Zod in the browser, and gracefully handles `VALIDATION_FAILED` responses from the API. |
| **R22. In-List Status Change** | Direct `<select>` dropdown and quick action buttons on each `TaskCard` update status via `PATCH /api/tasks/{id}` with instant TanStack Query cache invalidation. |
| **R23. Delete Task** | Delete action on each task with accessible `ConfirmationModal`. |
| **R24. Status Filtering** | Filter pills (`All`, `To Do`, `In Progress`, `Done`) and keyword search across titles and descriptions. |
| **R25. Non-Happy Path States** | Loading spinners while requests are in flight, empty state placeholders (`EmptyState`), and graceful `ErrorBanner` with a **Retry** button when the backend is offline. |
| **R26. Configurable Backend URL** | Centralized in `src/lib/services/index.ts` via `import.meta.env.VITE_API_BASE_URL`. |
| **Client-Side Routing & 404** | React Router v7 with route code-splitting and a dedicated `NotFound` page (`/random-path`) with "Go Back" and "Back to Task Manager" controls. |

---

## 5. Self-Check Verification (Section 4)

1. **Stop Frontend / Run Backend:**
   * Backend runs independently at `http://127.0.0.1:8000` answering curl requests (`curl http://127.0.0.1:8000/api/boards`).
2. **Stop Backend / Run Frontend:**
   * Stop the backend server and open `http://localhost:5173/`.
   * The frontend loads gracefully in the browser and displays an informative `ErrorBanner` ("Unable to connect to the backend server. Please verify the backend service is running") with a **Retry Request** button rather than crashing or showing a blank page.

---

## 6. Assumptions

1. **Single User / No Authentication:** As specified in Section 10 of the brief, authentication, sessions, and authorization are omitted.
2. **Network Protocol:** Communication is strictly over HTTP REST API to the backend service.
3. **Task Status Values:** Limited to `TODO`, `IN_PROGRESS`, and `DONE`.

---

## 7. Trade-offs & Decisions

1. **TanStack React Query v5 for Server State:** Rather than manual `useState`/`useEffect` data fetching or complex Redux boilerplate, TanStack Query provides automated background synchronization, request deduplication, window refetch handling, and declarative query key invalidation (`BOARD_QUERY_KEYS.all`).
2. **Domain-Colocated Types & Services:** Types and DTOs are colocated directly within their domain service folders (`board/`, `task/`, `api/`) rather than an isolated global `types/` folder, ensuring higher cohesion and easier modular refactoring.
3. **Shadcn Primitives:** Custom modular components with Tailwind CSS were built following Shadcn architecture for clean accessibility, keyboard navigation (`Escape` closing modals), and dark mode support without requiring heavy external widget bundles.
