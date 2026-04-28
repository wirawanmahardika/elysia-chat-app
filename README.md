# Chatify - A Clean Architecture Monolithic Chat App

This is a monolithic, real-time chat application designed to demonstrate robust, "senior-level" software engineering practices using modern tooling. Feature richness was purposely deprioritized to focus heavily on architectural cleanliness, strict type safety, performance, and security.

## Technology Stack
- **Runtime:** Bun (for extremely fast startup and native API support)
- **Framework:** ElysiaJS (with WebSockets and HTML plugins)
- **Database:** SQLite (embedded via Bun native driver)
- **ORM:** Drizzle ORM
- **Validation:** Zod

## Architectural Decisions

### 1. Clean Architecture (Layered Design)
The project strictly enforces a Layered Architecture to separate concerns and guarantee the business logic is decoupled from frameworks or IO mechanisms.

- **Domain Layer (`src/domain`):** Contains the core business schemas (`entities.ts`), Branded Types (`types.ts`), and interfaces for data access (`repositories.ts`). It has zero external dependencies (except Zod for DTOs).
- **Infrastructure Layer (`src/infrastructure`):** Handles everything outside the application's boundary. This includes the Drizzle ORM schemas, database connection logic, and concrete repository implementations that interact with SQLite.
- **Application Layer (`src/application`):** Contains the business use cases (`auth_service.ts`, `chat_service.ts`) orchestrating flow. It relies *only* on domain interfaces, making it highly testable.
- **Presentation Layer (`src/presentation`):** Uses ElysiaJS to expose HTTP endpoints, server-side rendered HTML views, and WebSocket connections.

### 2. Strict Type Safety & Branded Types
In addition to basic TypeScript usage, the system employs **Branded Types** (`UserId`, `MessageId`, `SessionId`). This prevents insidious bugs where one ID type might accidentally be passed to a function expecting another (e.g., passing a User ID to a deleteMessage function).

### 3. Authentication & Security
Instead of outsourcing auth, session-based authentication is implemented entirely from scratch:
- **Hashing:** Utilizes Bun's native `Bun.password` (bcrypt/argon2 abstraction) for secure credential hashing.
- **Session Tokens:** Generates highly secure, random 32-byte session tokens.
- **Cookies:** ElysiaJS securely signs session cookies (`httpOnly: true`, `sameSite: 'strict'`).
- **SQL Injection:** Mitigated comprehensively by using Drizzle ORM parameterized queries.
- **XSS Protection:** Input strings are strictly escaped before being rendered manually via Server-Side Rendering or DOM manipulation.

### 4. Real-time Engineering (WebSockets)
- **In-Memory Pub/Sub:** Since the app is a monolith, an `EventEmitter`-based `PubSubService` gracefully decouples the HTTP/WebSocket boundaries from the business logic. `ChatService` broadcasts messages, and WebSocket handlers safely subscribe.
- **Connection Management:** WebSockets implement a standard `ping/pong` heartbeat every 30 seconds to immediately detect and clean up stale or dead connections, mitigating memory leaks.
- **Memory Safety:** When a socket disconnects, the connection cleanup automatically deregisters event emitter subscriptions via a closure capture mechanism.

### 5. Database Optimization
- **Composite Indexing:** The SQLite schema features explicit indexes (like `idx_messages_id`) allowing for rapid sequential access to chat histories.
- **Cursor-Based Pagination:** Rather than performing slow `OFFSET/LIMIT` queries which degrade in performance linearly over time, the `getHistory` implementation relies purely on Cursor-Based Pagination (`WHERE id < :cursorId`), providing steady O(1) performance regardless of history depth.

## Running Locally

1. Install dependencies:
   \`\`\`bash
   bun install
   \`\`\`
2. Run database migrations:
   \`\`\`bash
   bun run src/infrastructure/database/migrate.ts
   \`\`\`
3. Start the server:
   \`\`\`bash
   bun run src/index.ts
   \`\`\`
4. Open your browser to \`http://localhost:3000\`