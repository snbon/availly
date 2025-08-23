<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class EmailTextGenerator
{
    private $client;
    private $apiKey;
    private $baseUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.openrouter.api_key');
        $this->baseUrl = config('services.openrouter.base_url');
    }

    public function generateEmailText(string $username, string $context = ''): array
    {
        $defaultText = "You can view my availability in the following link: https://myfreeslots.me/{$username}";

        // Check if API key is configured
        if (empty($this->apiKey)) {
            Log::warning('OpenRouter API key not configured, using default email text');
            return [
                'success' => false,
                'text' => $defaultText,
                'default' => $defaultText,
                'error' => 'AI service not configured'
            ];
        }

        try {
            $prompt = $this->buildPrompt($username, $context);

            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                    'HTTP-Referer' => 'https://myfreeslots.me',
                    'X-Title' => 'MyFreeSlots Email Generator'
                ],
                'json' => [
                    'model' => 'deepseek/deepseek-chat-v3-0324:free',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a professional email text generator. Return ONLY the requested text with no explanations, alternatives, or commentary.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'max_tokens' => 100,
                    'temperature' => 0.5
                ],
                'timeout' => 30
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (isset($data['choices'][0]['message']['content'])) {
                $generatedText = trim($data['choices'][0]['message']['content']);

                // Clean up the response - remove quotes and extra commentary
                $cleanedText = $this->cleanGeneratedText($generatedText, $username);

                return [
                    'success' => true,
                    'text' => $cleanedText,
                    'default' => $defaultText
                ];
            }

            throw new \Exception('Invalid response format from AI service');

        } catch (RequestException $e) {
            Log::error('OpenRouter API request failed', [
                'error' => $e->getMessage(),
                'username' => $username
            ]);

            return [
                'success' => false,
                'text' => $defaultText,
                'default' => $defaultText,
                'error' => 'AI service temporarily unavailable'
            ];

        } catch (\Exception $e) {
            Log::error('Email text generation failed', [
                'error' => $e->getMessage(),
                'username' => $username
            ]);

            return [
                'success' => false,
                'text' => $defaultText,
                'default' => $defaultText,
                'error' => 'Failed to generate custom text'
            ];
        }
    }

    private function buildPrompt(string $username, string $context): string
    {
        $basePrompt = "Generate ONLY a professional and friendly email text for sharing a calendar availability link. ";
        $basePrompt .= "IMPORTANT RULES:\n";
        $basePrompt .= "- Return ONLY the text to be copied and pasted\n";
        $basePrompt .= "- NO explanations, alternatives, or additional commentary\n";
        $basePrompt .= "- NO quotes around the text\n";
        $basePrompt .= "- Maximum 2 sentences\n";
        $basePrompt .= "- Must include the exact link: https://myfreeslots.me/{$username}\n";
        $basePrompt .= "- Sound natural and professional\n";
        $basePrompt .= "- End with a period\n\n";

        if (!empty($context)) {
            $basePrompt .= "Context: {$context}\n\n";
        }

        $basePrompt .= "Examples of GOOD responses (copy-paste ready):\n";
        $basePrompt .= "Hi! You can check my availability and book a time that works for both of us here: https://myfreeslots.me/{$username}\n";
        $basePrompt .= "Feel free to view my calendar and schedule a meeting at your convenience: https://myfreeslots.me/{$username}\n";
        $basePrompt .= "Here's my availability calendar where you can pick a time that suits you: https://myfreeslots.me/{$username}\n\n";

        $basePrompt .= "Examples of BAD responses (do NOT do this):\n";
        $basePrompt .= "\"Here's a great option: [text]\" (NO explanations)\n";
        $basePrompt .= "Here are two alternatives... (NO alternatives)\n";
        $basePrompt .= "Let me know if you'd like refinements! (NO additional commentary)\n\n";

        $basePrompt .= "Generate ONE copy-paste ready text now:";

        return $basePrompt;
    }

    private function cleanGeneratedText(string $text, string $username): string
    {
        // Remove surrounding quotes
        $text = trim($text, '"\'');

        // Split by lines and take only the first meaningful line
        $lines = explode("\n", $text);
        $cleanLines = [];

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip empty lines
            if (empty($line)) {
                continue;
            }

            // Skip lines that are clearly commentary or alternatives
            if (preg_match('/^(alternatively|let me know|here are|both options|for a different tone)/i', $line)) {
                break; // Stop processing once we hit commentary
            }

            // Skip lines in parentheses (usually alternatives)
            if (preg_match('/^\(.*\)$/', $line)) {
                continue;
            }

            // If the line contains the username link, it's likely the main text
            if (strpos($line, "myfreeslots.me/{$username}") !== false) {
                $cleanLines[] = $line;
                break; // We found the main text, stop here
            }

            // Add the line if it seems like main content
            $cleanLines[] = $line;
        }

        // Join the clean lines and ensure it ends with a period
        $result = implode(' ', $cleanLines);

        // Clean up multiple spaces
        $result = preg_replace('/\s+/', ' ', $result);

        // Ensure it ends with a period if it doesn't already end with punctuation
        if (!preg_match('/[.!?]$/', $result)) {
            $result .= '.';
        }

        return trim($result);
    }
}
