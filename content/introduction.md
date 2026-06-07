# Introduction

Welcome to **LLMesh**, a lightweight, highly modular PHP SDK designed for building robust AI-powered applications, agents, semantic search systems, and observability wrappers.

Unlike bulky, complex frameworks ported from other languages (like Python's LangChain) or framework-locked tools (like `laravel/ai`), LLMesh is built specifically for the broader PHP ecosystem. It provides clean interfaces, native PSR standards compliance, and works everywhere PHP runs—with optional, first-class support for Laravel.

---

## The LLMesh Core Philosophy

1. **Framework Agnostic**: The core engine (`llmesh/core`) runs in plain PHP CLI scripts, WordPress plugins, Symfony controllers, Slim APIs, or any custom PHP runtime.
2. **First-class Laravel Integration**: If you use Laravel, the `llmesh/laravel` package wraps the core cleanly, giving you facades, config-driven driver swapping, and native Eloquent memory stores.
3. **Observability Out-of-the-box**: A transparent middleware stack that lets you log, trace, and calculate USD token costs for every request without touching your business logic.
4. **Complete RAG Pipeline**: Provides a built-in document loader, character splitter, embedding generator, and vector store out of the box.

---

## LLMesh vs laravel/ai

While the Laravel team has introduced `laravel/ai` for their ecosystem, LLMesh serves as the complete PHP-wide AI SDK. Here is a structural comparison:

| Feature | laravel/ai | LLMesh (`llmesh/core`) |
|:---|:---:|:---:|
| **Framework Agnostic** | ❌ (Laravel only) | ✅ (Works everywhere) |
| **Standalone Providers** | ❌ (Monolithic dependencies) | ✅ (`llmesh/openai`, `llmesh/anthropic`) |
| **RAG Ingestion Pipeline** | ❌ (Embeddings only) | ✅ (Loader ➔ Splitter ➔ Vector Store) |
| **Built-in Cost Tracking** | ❌ (No native USD cost middleware) | ✅ (Integrated USD billing middleware) |
| **Turn-based Memory** | ❌ (Manual history management) | ✅ (Pluggable `Redis`, `Eloquent`, `InMemory` stores) |
| **Standard PSR Compliant** | ❌ (Tightly coupled HTTP/config) | ✅ (PSR-18 HTTP client, PSR-14 events, PSR-3 logging) |

---

## LLMesh vs Vercel AI SDK

If you are coming from the JavaScript ecosystem and have used the **Vercel AI SDK** (`ai-sdk.dev`), LLMesh will feel very familiar. It is designed to bring the same lightweight ergonomics to PHP:

| Concept / Action | Vercel AI SDK (JS) | LLMesh (PHP) |
|:---|:---|:---|
| **Text Generation** | `generateText()` | `LLMesh::generateText()` |
| **Response Streaming** | `streamText()` | `LLMesh::streamText()` |
| **Structured JSON** | `generateObject()` | `LLMesh::generateObject()` |
| **Tool Calling** | `tools` parameter | `Tool::make()` builder & `maxSteps` |
| **Memory / History** | Managed manually | `withMemory($store, $sessionId)` |

---

## What is Inside?

LLMesh provides a modular ecosystem. You load the core library, then install only the provider packages you need:

* **[llmesh/core](https://github.com/fyunusa/llmesh)**: The core interfaces, schema builder, agent loop, RAG pipeline, and observability middleware.
* **[llmesh/openai](https://github.com/fyunusa/llmesh-openai)**: The OpenAI driver implementing Chat Completions, Embeddings, and Streaming.
* **[llmesh/anthropic](https://github.com/fyunusa/llmesh-anthropic)**: The Anthropic driver implementing the Claude Messages API and tool-calling.
* **[llmesh/laravel](https://github.com/fyunusa/llmesh-laravel)**: The Laravel package providing managers, facades, Eloquent-backed stores, and Artisan commands.
