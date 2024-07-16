# 🐸 FragmentFrog

FragmentFrog is a React application designed to help users write, edit, and revise stories, documents, emails, or any other text quickly with keyboard shortcuts and AI assistance.

## 🐸 Concepts

- **Fragment**: A small piece of text, usually but not necessarily a sentence.
- **Fragment list**: A list of fragments that, when joined together, forms the current document.
- **Selected fragment**: The index of the currently selected fragment in the list.
- **Document**: The fragment list joined into a single string without introducing any additional whitespace.
- **Mode**: The current editor mode: "explore" (default), "edit", or "insert".

## 🐸 Features

- Main display area takes up 95% of the screen in both width and height.
- Fragments are rendered visually distinct, with the selected fragment highlighted.
- Ability to select a new, not-yet-created fragment at the end of the list.
- Keyboard controls for efficient navigation and editing.

## 🐸 Keyboard Controls

### Explore Mode (Default)
- Left/Right Arrow: Change selected fragment
- 'i': Insert a new fragment and switch to insert mode
- Space: Switch to edit mode
- 'd': Delete the current fragment

### Edit/Insert Mode
- Ctrl+Enter: Insert a newline
- Enter: Save changes and return to explore mode
- Escape: Discard changes (edit mode) or delete inserted fragment (insert mode) and return to explore mode

## 🐸 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🐸 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 🐸 License

This project is open source and available under the [MIT License](LICENSE).

Happy frogging! 🐸
