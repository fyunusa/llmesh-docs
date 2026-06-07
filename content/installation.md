# Installation & Setup

Getting started with LLMesh is straightforward. The project is split into the core library and provider-specific driver packages, ensuring you only install the dependencies you actually use.

---

## 1. Install via Composer

Require the core package and whichever provider packages you need for your application:

```bash
# Install the core LLMesh package
composer require llmesh/core

# Install OpenAI Provider (Optional)
composer require llmesh/openai

# Install Anthropic Provider (Optional)
composer require llmesh/anthropic

# Install Laravel Integration Package (Optional)
composer require llmesh/laravel
```

---

## 2. Configure Your API Keys

Create a `.env` file in your project root and add your API credentials:

```ini
# OpenAI Credentials
OPENAI_API_KEY=your-openai-api-key-here

# Anthropic Credentials
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

To load these variables in a standard PHP project (non-Laravel), we recommend using `vlucas/phpdotenv`:

```php
<?php

require __DIR__ . '/vendor/autoload.php';

// Load .env variables into $_ENV and getenv()
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();
```

---

## 3. Initialize Your Provider

After loading your autoloader and credentials, instantiate the provider of your choice:

```php
use LLMesh\OpenAI\OpenAIProvider;
use LLMesh\Anthropic\AnthropicProvider;

// Instantiate OpenAI Provider
$openAIProvider = new OpenAIProvider($_ENV['OPENAI_API_KEY']);

// Instantiate Anthropic Provider
$anthropicProvider = new AnthropicProvider($_ENV['ANTHROPIC_API_KEY']);
```

You are now ready to start generating text!
