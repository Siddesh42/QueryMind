import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    const { messages } = await request.json();
    console.log('Incoming messages:', messages);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Chat Assistant",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3-0324:free",
        "messages": messages,
        "stream": true
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    // Create a TransformStream for processing the response
    const stream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }
    });

    return new Response(response.body?.pipeThrough(stream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to get response from AI' },
      { status: 500 }
    );
  }
} 