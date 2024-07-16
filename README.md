# 🐸 FragmentFrog

FragmentFrog is a React application designed to help users write, edit, and revise stories, documents, emails, or any other text quickly with keyboard shortcuts and AI assistance.

## Concepts

- **Fragment**: A small piece of text, usually but not necessarily a sentence.
- **Fragment list**: A list of fragments that, when joined together, forms the current document.
- **Selected fragment**: The index of the currently selected fragment in the list.
- **Document**: The fragment list joined into a single string without introducing any additional whitespace.
- **Clipboard**: A list of tepmorary fragments with FIFO semantics to enable non-linear editing.
- **Mode**: The current editor mode: "explore" (default), "edit", or "insert".
- **Suggestion List**: A list of AI-generated suggestions for continuing the text.

## Keyboard Controls

### Explore Mode (Default)
- Left/Right Arrows: Change selected fragment
- CTRL+Left/Right Arrows: Moved the currently selected fragment left or right
- Space: Edits the selected fragment
- 'i': Insert a new fragment after selected fragment
- 'd': Deletes the selected fragment
- 'x': Cuts the selected fragment, placing it at the end of the Clipboard
- 'v': Pastes the top element from the clipboard
- Tab: Generate new suggestions
- 1, 2, 3, 4: Insert the corresponding suggestion (1st, 2nd, 3rd, or 4th) after the selected fragment
- Ctrl + 1, 2, 3, 4: Insert the corresponding suggestion without automatically generating new suggestions

### Edit/Insert Mode
- Ctrl+Enter: Insert a newline
- Enter: Save changes and return to explore mode
- Escape: Discard changes (edit mode) or delete inserted fragment (insert mode) and return to explore mode

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## LLM Suggestion List

The Suggestion List is an AI-powered feature that provides contextual suggestions for continuing your text. Here's how it works:

1. In Explore mode, press Tab to generate new suggestions based on the current context.
2. Four suggestions will appear in the suggestion panel at the bottom of the interface.
3. To insert a suggestion after the currently selected fragment, press the corresponding number key (1, 2, 3, or 4).
4. By default, new suggestions will be generated automatically after inserting a suggestion.
5. To insert a suggestion without generating new ones, hold Ctrl while pressing the number key.

The suggestion list helps you overcome writer's block and provides creative ideas for continuing your text!

## License

This project is open source and available under the [MIT License](LICENSE).

Happy frogging! 🐸
