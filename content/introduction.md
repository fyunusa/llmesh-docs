# Introduction

Welcome to **LLMesh**, a lightweight, highly modular PHP SDK designed for building robust AI-powered applications, agents, semantic search systems, and observability wrappers.

Unlike bulky, complex frameworks ported from other languages (like Python's LangChain), LLMesh is built specifically for PHP developers. It provides clean interfaces, native PSR standards compliance, and first-class support for Laravel.

---

## Core Philosophy

1. **Keep it Simple**: Standard operations (like generating text or streams) should require minimal boilerplate.
2. **First-class Laravel Integration**: Direct access to facades, config-driven driver swapping, and native database/Eloquent storage for conversational history.
3. **Observability Out-of-the-box**: A transparent middleware stack that lets you log, trace, and calculate USD token costs for every request without touching your business logic.
4. **Clean Schemas**: Enforces structured inputs and returns validated arrays instead of untyped string hashes.

---

## LLMesh vs Vercel AI SDK

If you are coming from the JavaScript ecosystem and have used the **Vercel AI SDK** (`ai-sdk.dev`), LLMesh will feel very familiar. It is designed to be the PHP equivalent, mapping concepts as follows:

| Feature / Concept | Vercel AI SDK (JS) | LLMesh (PHP) |
|:---|:---|:---|
| **Text Generation** | `generateText()` | `LLMesh::generateText()` |
| **Response Streaming** | `streamText()` | `LLMesh::streamText()` |
| **Structured JSON** | `generateObject()` | `LLMesh::generateObject()` |
| **Tool Calling** | `tools` parameter | `Tool::make()` builder & `maxSteps` |
| **Middlewares** | Experimental / Custom wrappers | `MiddlewareStack` / PSR-3 Loggers |
| **Conversational Memory** | Managed manually in arrays | `InMemoryStore`, `RedisStore`, `EloquentMemoryStore` |

---

## What is Inside?

LLMesh provides a modular ecosystem. You load the core library, then install only the provider packages you need:

* **[llmesh/core](https://github.com/fyunusa/llmesh)**: The core interfaces, schema builder, agent loop, RAG pipeline, and observability middleware.
* **[llmesh/openai](https://github.com/fyunusa/llmesh-openai)**: The OpenAI driver implementing Chat Completions, Embeddings, and Streaming.
* **[llmesh/anthropic](https://github.com/fyunusa/llmesh-anthropic)**: The Anthropic driver implementing the Claude Messages API and tool-calling.
* **[llmesh/laravel](https://github.com/fyunusa/llmesh-laravel)**: The Laravel package providing managers, facades, Eloquent-backed stores, and Artisan commands.
