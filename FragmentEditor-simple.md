# FragmentEditor

We are going to be creating a new React application called FragmentEditor.

The purpose of the application is to help a user write, edit and revise stories, documents, emails or any other text quickly with keyboard shortcuts and AI assistance.

Use create-react-app to generate the scaffolding, then provide all the required changes to the source code to implement the requirements below.

## Concepts

Fragment: A small piece of text, usually but not necessarily a sentence
Fragment list: A list of fragments that when joined together forms the current document.
Selected fragment: The index of the currently selected fragment in the list. It should be possible to select a new, not-yet-created fragment at the very end of the list.
Document: The fragment list joined into a single string without introducing any additional whitespace.
Mode: The current editor mode: "explore" (default) or "edit"

## The Fragment List

The main display area, the fragment list, should take up 95% of the screen in both width and height the rest should be padding.

Inside this area, render the current list of fragments.  Each fragment should be rendered visually distinctly with the selected fragment highlighted using background color.  Remember fragments may contain newlines, but should otherwise render tightly with adjacent fragments.

It should possible to select a new, not-yet-created fragment at the very end of the list which should render as `<new>` with a visually distinct background.

## Keyboard Controls

In the default "explore" mode, the following keyboard controls should be available:

- Left/right: change which fragment is selected
- space: transition to "edit" mode

In "edit" mode the Selected Fragment should be rendered as a textarea. If entered on the `<new>` fragment, the text should start empty and if the user accepts it with enter the fragment should be created and the selected fragment again moved to another `<new>`

The following keyboard controls should be available in "edit" mode:

- ctrl+enter: insert a newline
- enter: save changes to the fragment, return to explore mode
- escape: discard changes, return to "explore" mode

## Starting state

We should start in "explore" mode.
The fragment list should be empty.
The `<new>` virtual fragment at the end of the list should be selected.