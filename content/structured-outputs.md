# Structured Outputs

Standard text generation returns unstructured copy. When building APIs, parsing profiles, or integrating with internal systems, you need the model to output strict JSON data that matches a predefined schema.

LLMesh provides a robust `Schema` builder and validators that automatically parse, enforce, and validate output structures.

---

## 1. Defining a Schema

Use the `Schema` class to fluently define the data structure, types, constraints, and descriptions that you expect the model to return:

```php
use LLMesh\Core\Schema\Schema;

$schema = Schema::object([
    'name'      => Schema::string()->required()->description('The person\'s full name'),
    'age'       => Schema::integer()->required()->minimum(0),
    'interests' => Schema::array(Schema::string())->required()->description('Hobbies and topics of interest'),
])->required(['name', 'age', 'interests']);
```

---

## 2. Generating the Object

To request structured data, use `LLMesh::generateObject()` instead of `generateText()`. Pass a `GenerateObjectOptions` configuration containing your prompt and schema.

```php
use LLMesh\Core\LLMesh;
use LLMesh\Core\Generators\GenerateObjectOptions;
use LLMesh\OpenAI\OpenAIProvider;

$provider = new OpenAIProvider($_ENV['OPENAI_API_KEY']);

try {
    $response = LLMesh::generateObject(
        $provider,
        GenerateObjectOptions::make()
            ->withPrompt('Extract profiles from: John is a 32-year-old designer who loves surfing and photography.')
            ->withSchema($schema)
    );

    // LLMesh automatically parses and returns the output as a PHP associative array
    $profile = $response->object;
    
    echo "Name:      " . $profile['name'] . "\n";
    echo "Age:       " . $profile['age'] . "\n";
    echo "Interests: " . implode(', ', $profile['interests']) . "\n";

} catch (\LLMesh\Core\Exceptions\ValidationException $e) {
    // Thrown if the LLM output violates the defined JSON Schema constraints
    echo "❌ Validation Error: " . $e->getMessage() . "\n";
    print_r($e->errors());
}
```

---

## 3. Output Modes

LLMesh supports two strategies for structured output configuration via the `withMode()` option:

* **`OutputMode::JSON_MODE` (Default)**: Injects the schema as instructions into the system prompt. Works with all providers.
* **`OutputMode::TOOL_MODE`**: Encodes the schema as a tool definition and uses native tool-calling parameters (function calling). This is highly recommended for complex schemas or when using models like Claude that support native tool execution.

### Example Using Tool Mode:
```php
use LLMesh\Core\Generators\OutputMode;

$options = GenerateObjectOptions::make()
    ->withPrompt('Extract profiles from text...')
    ->withSchema($schema)
    ->withMode(OutputMode::TOOL_MODE); // Enforce tool-calling parameters
```

---

## 4. Structured Extraction (Pydantic-Style)

As an alternative to programmatically defining schemas using the `Schema` class, LLMesh supports **Pydantic-style Structured Extraction**. This allows you to define a standard PHP class that extends `LLMModel` and decorate it with attributes. LLMesh automatically generates the JSON Schema, requests the LLM to fill it, coerces types, validates constraints, and hydrates the response into a fully-typed object.

### Example Implementation

First, define your model classes by extending `LLMModel`:

```php
use LLMesh\Core\Structured\LLMModel;
use LLMesh\Core\Structured\Attributes\Field;
use LLMesh\Core\Structured\Attributes\Description;

#[Description("A structured invoice extracted from a text document")]
class Invoice extends LLMModel
{
    public function __construct(
        #[Field(description: "Invoice reference number", example: "INV-2026-001")]
        public readonly string $invoiceNumber,

        #[Field(description: "Total invoice amount in USD", minimum: 0)]
        public readonly float $totalAmount,

        #[Field(description: "Due date in ISO 8601 format")]
        public readonly \DateTimeImmutable $dueDate,

        #[Field(description: "Line items on the invoice", items: LineItem::class)]
        public readonly array $lineItems,

        public readonly InvoiceStatus $status,
    ) {}

    // Post-construction validation
    public function validate(): void
    {
        if ($this->totalAmount < 0) {
            throw new \InvalidArgumentException("Total amount must be non-negative.");
        }
    }
}

class LineItem extends LLMModel
{
    public function __construct(
        #[Field(description: "Item name")]
        public readonly string $name,

        #[Field(description: "Quantity", minimum: 1)]
        public readonly int $quantity,

        #[Field(description: "Unit price", minimum: 0)]
        public readonly float $unitPrice,
    ) {}
}

enum InvoiceStatus: string
{
    case Paid = 'paid';
    case Unpaid = 'unpaid';
}
```

### Performing the Extraction

Use `LLMesh::extract()` or the shorthand `LLMesh::extractFrom()` to run the extraction:

```php
use LLMesh\Core\LLMesh;
use LLMesh\OpenAI\OpenAIProvider;

$provider = new OpenAIProvider($_ENV['OPENAI_API_KEY']);
$text = "We received invoice INV-2026-005 from ACME Corp. The amount is $350.00, due on 2026-06-30. Status is unpaid. Line items: 5 Notebooks at $10.00 each, and 3 Backpacks at $100.00 each.";

/** @var Invoice $invoice */
$invoice = LLMesh::make()->extractFrom(
    Invoice::class,
    $text,
    $provider
);

// Fully typed properties and IDE autocomplete work out-of-the-box!
echo $invoice->invoiceNumber;              // "INV-2026-005" (string)
echo $invoice->totalAmount;                // 350.0 (float)
echo $invoice->dueDate->format('Y-m-d');   // "2026-06-30" (DateTimeImmutable)
echo $invoice->status->value;              // "unpaid" (InvoiceStatus enum)
echo $invoice->lineItems[0]->name;         // "Notebooks" (typed LineItem)
```

### Self-Correction & Type Coercion

* **Self-Correction Retry Loop**: If the LLM response contains invalid JSON or fails the schema or model `validate()` rules, LLMesh will feed the exact validation error back to the model and retry up to `maxRetries` (defaults to 3) to automatically self-correct.
* **Automatic Type Coercion**: The coercer automatically handles converting string values into `DateTimeImmutable` or `DateTime` objects, backed enum cases (like `InvoiceStatus`), booleans, floats, and recursive nested model lists.

