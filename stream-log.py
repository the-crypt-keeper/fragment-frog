import argparse
import json
import requests
import sseclient

BASE_URL = "http://localhost:3333"

def make_streaming_request(endpoint, payload):
    response = requests.post(f"{BASE_URL}{endpoint}", json=payload, stream=True)
    client = sseclient.SSEClient(response)
    return client

def capture_stream(client):
    captured_data = []
    for event in client.events():
        if event.data != "[DONE]":
            try:
                data = json.loads(event.data)
                captured_data.append(data)
            except json.JSONDecodeError:
                captured_data.append({"raw_data": event.data})
    return captured_data

def main(model):
    # Chat completions request
    chat_payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a creative writing assistant. Continue the story provided by the user."
            },
            {
                "role": "user",
                "content": "Once upon a time, in the heart of the Enchanted Forest, there lived a small rabbit named Rusty. The dragon blinked its bright, emerald eyes and sneezed out a puff of smoke. The dragon, surprised, puffed out a small gust of smoke, revealing a cute, chubby face with a pointed snout."
            }
        ],
        "max_tokens": 50,
        "n": 4,
        "stop": ["."],
        "stream": True
    }

    chat_client = make_streaming_request("/v1/chat/completions", chat_payload)
    chat_data = capture_stream(chat_client)

    with open(f"{model}-chat.json", "w") as f:
        json.dump(chat_data, f, indent=2)

    # Text completions request
    text_payload = {
        "model": model,
        "prompt": "### Instruction: You are a creative writing assistant. Continue the story provided by the user.\n\n### Response: Once upon a time, in the heart of the Enchanted Forest, there lived a small rabbit named Rusty. The dragon blinked its bright, emerald eyes and sneezed out a puff of smoke. The dragon, surprised, puffed out a small gust of smoke, revealing a cute, chubby face with a pointed snout.",
        "max_tokens": 50,
        "n": 4,
        "stop": ["."],
        "stream": True
    }

    text_client = make_streaming_request("/v1/completions", text_payload)
    text_data = capture_stream(text_client)

    with open(f"{model}-text.json", "w") as f:
        json.dump(text_data, f, indent=2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Capture streaming data from chat and text completion endpoints.")
    parser.add_argument("model", help="The model name to use for the requests")
    args = parser.parse_args()

    main(args.model)
