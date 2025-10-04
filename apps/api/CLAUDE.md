# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

- `npm run start:dev` - Start API server in development mode with hot reload
- `npm run start:worker:dev` - Start worker process in development mode
- `npm run build` - Build the application with increased memory allocation
- `npm run lint` - Run ESLint with auto-fix

### Testing

- `npm run test` - Run unit tests
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:e2e` - Run end-to-end tests

### Production

- `npm run start:prod` - Start API server in production mode
- `npm run start:worker:prod` - Start worker process in production mode

## Architecture Overview

### Application Structure

This is a NestJS API with a modular architecture supporting dual-mode operation:

1. **API Mode** (`--mode=api`) - Serves HTTP endpoints with controllers enabled
2. **Worker Mode** (`--mode=worker`) - Runs background jobs and cron tasks

### Key Architectural Components

**Avvocato260 API** is a NestJS API/microservice built to support an APP using REST and WebSockets functionalities. The API uses {json:api}.

#### Key Technologies

- **NestJS 11**
- **{json:api}**

#### Features Module System

The codebase is organized into feature modules under `src/features/`:

- **AI**: Advanced AI agents and LLM integrations (contextualiser, responder, scribe, etc.)
- **General**: Core platform functionality (auth, users, companies, notifications)
- **CRM**: Customer relationship management (accounts, contacts, meetings, opportunities)
- **Filevault**: Document management and processing
- **Wiki**: Knowledge management and article system
- **Helpdesk**: Support ticket and annotation system

#### Common Infrastructure

- **Neo4j**: Primary graph database for relationships and knowledge graphs
- **Redis**: Caching, queues, and distributed services
- **BullMQ**: Background job processing with multiple queues
- **Fastify**: High-performance HTTP server
- **JSON:API**: Standardized API responses with serializers

#### AI Agent System

Complex multi-agent AI architecture with:

- Contextual processing agents (contextualiser, documentor, taxonomer)
- Knowledge graph creation and consolidation
- LangChain and LangGraph integration for agent workflows
- Multiple LLM provider support (OpenAI, Azure OpenAI, Ollama)

### Database & Persistence

- **Neo4j**: Graph database for entities and relationships
- **Redis**: Session storage, caching, and message queues
- Entity/Repository pattern with custom Neo4j queries

### Configuration

- Environment-based configuration via `src/config/config.ts`
- Supports multiple deployment modes and feature toggles
- I18n support with English locale files

### Testing Strategy

- Unit tests with Jest
- E2E tests using testcontainers for isolated environments
- Custom JSON:API validation framework
- Comprehensive test fixtures and data management

## Claude Code Problem-Solving Methodology

When analyzing issues in complex systems:

1. **Always explore the full call chain** - don't just look at the immediate file
2. **Check factory/creation patterns** - look at how objects are initialized
3. **Trace data flow from source to destination** - follow the complete pipeline
4. **Use tools to search for related code** - don't assume, verify by searching
5. **For AI agents specifically**:
   - Check context factories for state initialization
   - Look at how previous conversation state is restored
   - Examine reducers AND how they're called
   - Trace notebook/state accumulation across conversation turns

### Search Strategy

- Use `Glob` to find related files by pattern
- Use `Grep` to search for specific function/variable usage
- Use `Task` tool for complex multi-file searches
- Always read factory classes when debugging state issues

### Module Structure Pattern

Each feature module typically follows this structure:

```
module-name/
├── module-name.module.ts   # Entity module
├── controllers/            # REST controllers
├── dtos/                   # Data transfer objects
├── entities/               # Entity definitions
│   ├── entity.entity.ts    # Neo4j entity
│   ├── entity.map.ts       # Entity mapping
│   ├── entity.meta.ts      # Entity metadata
│   └── entity.model.ts     # Entity model
├── repositories/           # Data access layer
├── serialisers/            # JSON:API serializers
└── services/               # Business logic
```
