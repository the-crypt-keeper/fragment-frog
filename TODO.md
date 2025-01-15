- CLEANUP: figure out how to merge the two storages, this was an unforseen dichotomy

- FEAT: rethink the completion modes. we want an assistant prefill completion mode.

- FEAT: chat completions need leading-space injection logic

- FEAT: replace logo.svg, favicon and the two rendered logos with frogs

- FEAT: configure more than 2 models
    - start with 0 models, have model add/delete buttons
      - unmapped suggestions should be gray and say to open settings to setup suggestions
    - model reorder mechanism

- FEAT: resurrect the clipstack

- FEAT: auto-save/auto-load everything via local storage

- BUG: handle litellm proxy errors that look like this:

data: {"error": {"message": "litellm.APIError: APIError: OpenAIException - litellm.APIConnectionError: APIConnectionError: Text-completion-openaiException - An error occurred during streaming", "type": null, "param": null, "code": "500"}}

- TEST: LLM parsing

- TEST: React component-level tests

- TEST: React app-level tests?