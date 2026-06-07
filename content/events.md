# PSR-14 Events

LLMesh conforms to the **PSR-14 Event Dispatcher** specification. The core engine dispatches lifecycle events during standard and streaming generation, enabling you to build audit logs, handle request metrics, clean resources, or attach custom hooks without modifying your application logic.

---

## Fired Events

The following event classes are dispatched during execution:

### Text & Object Generation Events
* **`LLMesh\Core\Events\GenerationStarted`**: Fired immediately before the provider is called. Contains the provider name and the request options.
* **`LLMesh\Core\Events\GenerationCompleted`**: Fired after the provider responds successfully. Contains the provider name, response object, and duration in milliseconds.
* **`LLMesh\Core\Events\GenerationFailed`**: Fired if the API call throws an exception. Contains the provider name and the thrown exception.

### Structured Extraction Events
* **`LLMesh\Core\Events\ExtractionStarted`**: Fired immediately before structured extraction starts. Contains `modelClass`, `providerName`, and `inputLength` (character count of the input text).
* **`LLMesh\Core\Events\ExtractionCompleted`**: Fired after structured extraction succeeds. Contains `modelClass`, `result` (typed concrete `LLMModel` instance), `attemptsUsed`, and `durationMs`.
* **`LLMesh\Core\Events\ExtractionRetrying`**: Fired when an extraction attempt fails and self-correction is triggered. Contains `modelClass`, `attempt` (index of attempt), and `errorMessage`.
* **`LLMesh\Core\Events\ExtractionFailed`**: Fired when all extraction attempts are exhausted and validation fails. Contains `modelClass`, `totalAttempts`, and `lastError`.

---

## 1. Creating a Simple Dispatcher

You can pass any PSR-14 compliant event dispatcher (like Symfony's EventDispatcher, Laravel's Event Dispatcher, or a custom one). 

Here is a simple example of a custom listener dispatcher:

```php
use Psr\EventDispatcher\EventDispatcherInterface;

class SimpleEventDispatcher implements EventDispatcherInterface
{
    private array $listeners = [];

    public function addListener(string $eventClass, callable $listener): void
    {
        $this->listeners[$eventClass][] = $listener;
    }

    public function dispatch(object $event): object
    {
        $eventClass = get_class($event);
        if (isset($this->listeners[$eventClass])) {
            foreach ($this->listeners[$eventClass] as $listener) {
                $listener($event);
            }
        }
        return $event;
    }
}
```

---

## 2. Registering Listeners & Running LLMesh

Wire your dispatcher to the listeners, pass it to the `LLMesh` facade builder, and run your query:

```php
use LLMesh\Core\LLMesh;
use LLMesh\Core\Generators\GenerateTextOptions;
use LLMesh\Core\Events\GenerationStarted;
use LLMesh\Core\Events\GenerationCompleted;
use LLMesh\OpenAI\OpenAIProvider;

$dispatcher = new SimpleEventDispatcher();

// Register a start listener
$dispatcher->addListener(GenerationStarted::class, function (GenerationStarted $event) {
    echo "📢 [Event] Generation started on provider: " . $event->provider . "\n";
});

// Register a completion listener
$dispatcher->addListener(GenerationCompleted::class, function (GenerationCompleted $event) {
    echo "📢 [Event] Generation completed! Duration: " . $event->durationMs . " ms\n";
    echo "         Tokens used: " . $event->response->getUsage()->getTotalTokens() . "\n";
});

// Build an LLMesh instance configured with our event dispatcher
$llmesh = LLMesh::make()->withEventDispatcher($dispatcher);

$provider = new OpenAIProvider($_ENV['OPENAI_API_KEY']);
$options = GenerateTextOptions::make()->withPrompt('Say hello!');

// Execute the call
$response = $llmesh->generateText($provider, $options);
```

If you are using the `llmesh/laravel` integration package, core events are bridged to Laravel's event dispatcher automatically. You can write standard Laravel listeners and event subscribers for any LLMesh event out-of-the-box!
