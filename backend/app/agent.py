import os
import httpx
import json

SYSTEM_PROMPT = (
    "You are Vasuki, a helpful AI assistant. Answer concisely and helpfully."
)

DEFAULT_MODEL = "gpt-3.5-turbo"

async def generate_response(message: str, history: list = None, stream: bool = False):
    """Generate a response for `message`. If OPENAI_API_KEY is present, call OpenAI Chat Completions.
    If stream=True, returns an async generator.
    Otherwise returns a dict: {"text": str}
    """
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
    if not api_key:
        # Offline development fallback
        return {"text": f"Vasuki (offline): I received: {message}"}

    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        # history is expected as list of {role: 'user'|'assistant', content: '...'}
        messages.extend(history)
    messages.append({"role": "user", "content": message})

    payload = {"model": model, "messages": messages, "temperature": 0.6, "stream": stream}

    async with httpx.AsyncClient(timeout=30.0) as client:
        if stream:
            async def streamer():
                async with client.stream("POST", url, headers=headers, json=payload) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if line.startswith("data:"):
                            data_str = line[len("data:"):].strip()
                            if data_str == "[DONE]":
                                break
                            chunk = json.loads(data_str)
                            delta = chunk["choices"][0].get("delta", {})
                            if "content" in delta:
                                yield delta["content"]
            return streamer()
        else:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"].strip()
            return {"text": text}
