# Laravel Integration

LLMesh comes with first-class Laravel integration via the `llmesh/laravel` bridge package. It automates container bindings, registers facades, integrates with Laravel's event dispatcher, and provides persistent Eloquent database memory out-of-the-box.

---

## 1. Installation & Publishing Config

Install the package alongside your preferred providers:

```bash
composer require llmesh/laravel llmesh/openai
```

Laravel auto-registers the service provider. Publish the configuration template to your project:

```bash
php artisan vendor:publish --tag=llmesh-config
```

This creates the configuration file at `config/llmesh.php`.

---

## 2. Configuration Setup

Open `config/llmesh.php` to configure your default driver and active keys. It uses standard environment variables:

```php
return [
    // The default driver used by the facade
    'default' => env('LLMESH_PROVIDER', 'openai'),

    'providers' => [
        'openai' => [
            'class'   => \LLMesh\OpenAI\OpenAIProvider::class,
            'api_key' => env('OPENAI_API_KEY'),
            'model'   => env('OPENAI_MODEL', 'gpt-4o'),
        ],
        'anthropic' => [
            'class'   => \LLMesh\Anthropic\AnthropicProvider::class,
            'api_key' => env('ANTHROPIC_API_KEY'),
            'model'   => env('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022'),
        ],
    ],

    'memory' => [
        'driver' => env('LLMESH_MEMORY_DRIVER', 'database'), // "database", "redis", or "in_memory"
    ],
];
```

---

## 3. Using the Facade

Import the `LLMesh` facade to run text generation or streams. The facade resolves the default provider from configuration automatically, keeping your code extremely minimal:

```php
use LLMesh\Laravel\Facades\LLMesh;
use LLMesh\Core\Generators\GenerateTextOptions;

// 1. Basic generation (resolves default provider)
$response = LLMesh::generateText(
    GenerateTextOptions::make()->withPrompt('Explain APIs in 1 sentence.')
);
echo $response->getText();

// 2. Swapping the driver on the fly
$anthropicResponse = LLMesh::generateText(
    options:  GenerateTextOptions::make()->withPrompt('Say hello!'),
    provider: app('llmesh.provider.anthropic') // swap to anthropic manually
);
```

---

## 4. Eloquent Conversation Memory

To persist conversation history in your database using Eloquent:

1. Publish the database migration file:
   ```bash
   php artisan vendor:publish --tag=llmesh-migrations
   ```
2. Run your migrations:
   ```bash
   php artisan migrate
   ```
3. Set your memory driver to `'database'` inside `config/llmesh.php`.
4. Run your queries. History is automatically saved/loaded from your database:

```php
$response = LLMesh::generateText(
    GenerateTextOptions::make()
        ->withPrompt("My name is Sarah.")
        ->withMemory(app(LLMesh\Core\Contracts\MemoryStoreInterface::class), "user-session-123")
);
```

---

## 5. Artisan Commands

LLMesh includes CLI commands to inspect and test your integration:

```bash
# Verify your configurations and test a prompt directly
php artisan llmesh:test

# List all loaded providers and packages
php artisan llmesh:providers

# Clear conversation history logs for a session
php artisan llmesh:clear-memory user-session-123
```
