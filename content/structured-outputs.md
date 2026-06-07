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
