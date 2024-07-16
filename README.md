# 🐸 FragmentFrog

FragmentFrog is a React application designed to help users write, edit, and revise stories, documents, emails, or any other text quickly with keyboard shortcuts and AI assistance.

## Concepts

- **Fragment**: A small piece of text, usually but not necessarily a sentence.
- **Fragment list**: A list of fragments that, when joined together, forms the current document.
- **Selected fragment**: The index of the currently selected fragment in the list.
- **Document**: The fragment list joined into a single string without introducing any additional whitespace.
- **Clipboard**: A list of tepmorary fragments with FIFO semantics to enable non-linear editing.
- **Mode**: The current editor mode: "explore" (default), "edit", or "insert".

## Keyboard Controls

### Explore Mode (Default)
- Left/Right Arrows: Change selected fragment
- CTRL+Left/Right Arrows: Moved the currently selected fragment left or right
- Space: Edits selected fragments
- 'i': Insert a new fragment after selected fragment
- 'd': Deletes the selected fragment
- 'x': Cuts the selected fragment, placing it at the end of the Clipboard
- 'v': Pastes the top element from the clipboard.

### Edit/Insert Mode
- Ctrl+Enter: Insert a newline
- Enter: Save changes and return to explore mode
- Escape: Discard changes (edit mode) or delete inserted fragment (insert mode) and return to explore mode

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

Happy frogging! 🐸
