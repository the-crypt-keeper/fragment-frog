# base url = http://localhost:3333/

# payload for endpoint = /v1/chat/completions
# {
#   model: <MODEL>,
#   messages: [
#     {
#       role: 'system',
#       content: 'You are a creative writing assistant. Continue the story provided by the user.'
#     },
#     {
#       role: 'user',
#       content: 'Once upon a time, in the heart of the Enchanted Forest, there lived a small rabbit named Rusty. The dragon blinked its bright, emerald eyes and sneezed out a puff of smoke. The dragon, surprised, puffed out a small gust of smoke, revealing a cute, chubby face with a pointed snout.'
#     }
#   ],
#   max_tokens: 50,
#   n: 4,
#   stop: [ '.' ],
#   stream: true
# }

# payload for endpoint = /v1/completions
# {
#   model: <MODEL>,
#   prompt: '### Instruction: You are a creative writing assistant. Continue the story provided by the user.\n' +
#     '\n' +
#     '### Response:Once upon a time, in the heart of the Enchanted Forest, there lived a small rabbit named Rusty. The dragon blinked its bright, emerald eyes and sneezed out a puff of smoke. The dragon, surprised, puffed out a small gust of smoke, revealing a cute, chubby face with a pointed snout.',
#   max_tokens: 50,
#   n: 4,
#   stop: [ '.' ],
#   stream: true
# }