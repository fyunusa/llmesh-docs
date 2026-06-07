# Text Generation & Streaming

LLMesh provides a clean, unified interface for standard and real-time streaming text generation. You write the same options block and query pattern regardless of the underlying LLM provider.

---

## 1. Basic Text Generation

To generate text, initialize your provider, construct a `GenerateTextOptions` configuration, and invoke `LLMesh::generateText()`.

```php
use LLMesh\Core\LLMesh;
use LLMesh\Core\Generators\GenerateTextOptions;
use LLMesh\OpenAI\OpenAIProvider;

$provider = new OpenAIProvider($_ENV['OPENAI_API_KEY']);

$options = GenerateTextOptions::make()
    ->withPrompt('Explain gravity to a five-year-old.')
    ->withTemperature(0.5); // (Optional) Detemining creativity (0.0 to 1.0)

// Send request
$response = LLMesh::generateText($provider, $options);

// Print the response text
echo $response->getText();
```

### Response Metadata & Usage
The `TextResponse` object contains rich metadata about the generation:

```php
$usage = $response->getUsage();

echo "Input Tokens:  " . $usage->getInputTokens() . "\n";
echo "Output Tokens: " . $usage->getOutputTokens() . "\n";
echo "Total Tokens:  " . $usage->getTotalTokens() . "\n";
echo "Finish Reason: " . $response->getFinishReason() . "\n"; // e.g. 'stop', 'length'
```

---

## 2. Real-Time Text Streaming

For streaming, use `LLMesh::streamText()`. It returns a `StreamResponse` which implements `Iterator`, allowing you to loop through chunks of text as they arrive from the API.

```php
use LLMesh\Core\LLMesh;
use LLMesh\Core\Generators\GenerateTextOptions;
use LLMesh\OpenAI\OpenAIProvider;

$provider = new OpenAIProvider($_ENV['OPENAI_API_KEY']);
$options = GenerateTextOptions::make()->withPrompt('Write a short paragraph about space exploration.');

// Initiate stream (lazy - does not execute API call until iteration starts)
$stream = LLMesh::streamText($provider, $options);

echo "Stream output: ";
foreach ($stream as $chunk) {
    // Print each chunk immediately
    echo $chunk->text;
    
    // Flush PHP buffers so output displays in the browser/terminal in real-time
    flush();
}
echo "\nStream finished!";
```

### How Chunks are Represented
Each item yielded by the stream iterator is a `ChunkDelta` object containing:
* `$chunk->text`: The newly generated text fragment.
* `$chunk->toolCall`: A `ToolCall` DTO (if the model is streaming tool parameters).
* `$chunk->finishReason`: The completion reason string (only present on the final chunk).
