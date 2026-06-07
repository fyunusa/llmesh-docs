# Conversation Memory

LLMs are stateless: they do not inherently remember previous requests or answers. To create natural chat interfaces, you must maintain a history of the conversation and pass it back in each request. 

LLMesh simplifies this using the **Memory Store** interface, allowing you to attach conversation history in a single line of code.

---

## How It Works

1. You initialize a memory store (e.g. `InMemoryStore`, `RedisStore`, or `EloquentMemoryStore`).
2. You define a unique `sessionId` representing the user's specific chat session.
3. You bind the store and the session ID to your request options.
4. LLMesh automatically retrieves the chat history, prepends it to the request, executes the query, and stores the new question and answer back into the database/memory.

---

## 1. Using In-Memory Store

The `InMemoryStore` stores the chat history in memory for the duration of the current PHP request lifecycle. This is perfect for CLI scripts and testing.

```php
use LLMesh\Core\LLMesh;
use LLMesh\Core\Generators\GenerateTextOptions;
use LLMesh\Core\Memory\InMemoryStore;
use LLMesh\OpenAI\OpenAIProvider;

$provider = new OpenAIProvider($_ENV['OPENAI_API_KEY']);
$store = new InMemoryStore();
$sessionId = 'user-session-999';

// --- ROUND 1 ---
$options1 = GenerateTextOptions::make()
    ->withPrompt("My favorite programming language is PHP.")
    ->withMemory($store, $sessionId);

$response1 = LLMesh::generateText($provider, $options1);
echo "LLM: " . $response1->getText() . "\n\n";

// --- ROUND 2 (Recall) ---
$options2 = GenerateTextOptions::make()
    ->withPrompt("What is my favorite language?")
    ->withMemory($store, $sessionId); // Same store and session ID

$response2 = LLMesh::generateText($provider, $options2);
echo "LLM: " . $response2->getText() . "\n";
// Output: "Your favorite language is PHP!"
```

---

## 2. Other Memory Stores

For web applications, conversations need to persist across multiple HTTP requests. LLMesh provides drivers for this:

### Redis Store
Requires `ext-redis` or `predis/predis` package to connect to a Redis server:

```php
use LLMesh\Core\Memory\RedisStore;

// Pass a Redis client instance, prefix, and TTL (in seconds)
$redisClient = new Redis();
$redisClient->connect('127.0.0.1', 6379);

$store = new RedisStore($redisClient, 'chat:sessions:', 3600);
```

### Laravel Eloquent Memory Store
If you use the `llmesh/laravel` package, conversation history can be saved automatically to your database using Eloquent. 

*(See the [Laravel Integration](#laravel) chapter for configuration details).*
