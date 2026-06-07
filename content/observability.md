# Observability Stack

In production AI applications, you need visibility into how models behave: what prompts are sent, how long API requests take, and how much money they cost.

LLMesh includes a built-in **Middleware Stack** that intercepts calls to log requests and track usage metrics automatically.

---

## 1. Wrapping the Provider

The `MiddlewareStack` patterns allows you to wrap any standard LLMesh provider (OpenAI, Anthropic, etc.) with middlewares. You then query this wrapped provider just like a raw one:

```php
use LLMesh\Core\Observability\MiddlewareStack;
use LLMesh\Core\Observability\LoggingMiddleware;
use LLMesh\Core\Observability\CostTrackingMiddleware;
use LLMesh\Core\Observability\UsageTracker;
use LLMesh\OpenAI\OpenAIProvider;

$rawProvider = new OpenAIProvider($_ENV['OPENAI_API_KEY']);
$tracker = new UsageTracker();
$logger = new ConsoleLogger(); // (See PSR-3 Logger below)

// Wrap the provider with logging and cost-tracking wrappers
$provider = MiddlewareStack::wrap($rawProvider)
    ->with(new LoggingMiddleware($logger))
    ->with(new CostTrackingMiddleware($tracker));
```

---

## 2. Request Logging (PSR-3)

The `LoggingMiddleware` accepts any PSR-3 compatible logger (such as Monolog in Laravel, or a custom one). It logs:
* Successful generations (level `DEBUG` with input/output tokens, duration, cost).
* Rate limit warnings (level `WARNING`).
* Other provider errors (level `ERROR`).

### Minimal Console Logger Example:
```php
use Psr\Log\AbstractLogger;

class ConsoleLogger extends AbstractLogger
{
    public function log($level, string|\Stringable $message, array $context = []): void
    {
        $time = date('Y-m-d H:i:s');
        echo "[{$time}] [" . strtoupper($level) . "] {$message}\n";
        if (!empty($context)) {
            echo "Payload: " . json_encode($context) . "\n";
        }
    }
}
```

---

## 3. Usage & Cost Tracking

The `CostTrackingMiddleware` records the token metrics of every call into a `UsageTracker` instance.

### Configuring Model Pricing
To estimate token cost in USD, set the pricing structure for your models in your bootstrap file using `CostCalculator::setPricing()` (rates are calculated per **1 Million tokens**):

```php
use LLMesh\Core\Observability\CostCalculator;

// CostCalculator::setPricing(modelName, inputRatePer1M, outputRatePer1M)
CostCalculator::setPricing('gpt-4o', 2.50, 10.00); 
```

### Retrieving the Usage Summary
At any point, retrieve a summary from your tracker instance:

```php
$summary = $tracker->getSummary();

echo "Total Calls Made: " . $summary['calls'] . "\n";
echo "Total Input Tokens:  " . $summary['tokens_in'] . "\n";
echo "Total Output Tokens: " . $summary['tokens_out'] . "\n";
echo "Total Estimated Cost: $" . number_format($summary['cost_usd'], 6) . " USD\n";
```
This is ideal for calculating user billing quotas or building admin dashboards.
