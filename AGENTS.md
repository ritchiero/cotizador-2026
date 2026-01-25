# Agent Learnings

## Tiptap Editor Implementation Learnings

### Component Architecture
- **Extension Management**: Tiptap extensions must be imported as named imports from @tiptap/extension-* packages
- **Theme Integration**: Pass theme styles as props to TiptapEditor for dynamic styling without rebuilding component
- **State Coordination**: Multiple related states (content, themes, save status, change tracking) need coordinated updates

### CSS and Styling
- **Tailwind-to-CSS Conversion**: Custom utility function needed for inline style application since @apply doesn't work in dangerouslySetInnerHTML
- **CSS Specificity**: .tiptap-editor .ProseMirror selector required to override default Tiptap styles
- **Dynamic CSS Injection**: <style> tag with dangerouslySetInnerHTML allows runtime theme application to ProseMirror elements

### User Experience Patterns
- **Change Tracking**: hasUnsavedChanges + originalContent state enables real-time edit detection
- **Modal UX**: Confirmation only appears when needed, seamless flow otherwise
- **Accessibility**: getButtonClass() function centralizes focus states (focus:ring-4 focus:ring-blue-100)
- **Responsive Design**: overflow-x-auto allows horizontal scroll on small screens without breaking layout

### Firebase Integration
- **Auto-save Patterns**: Use debounce with 3s delay, updateDoc with serverTimestamp() for optimal UX balance
- **Content Persistence**: HTML content overwrites original markdown in Firestore for edited version preservation
- **State Reset**: After regeneration, update both editorContent and originalContent to reset tracking

### Component Organization
- **Separation of Concerns**: Split handleRegenerate() and performRegeneration() for cleaner conditional logic
- **Utility Functions**: Moving style logic into utility functions improves maintainability and consistency
- **Button Grouping**: Logical toolbar groups ([Headers] | [B I U] | [Listas] | [Tabla] | [Alineación] | [Undo Redo]) improve tool discoverability

## Key Code Patterns

### Tiptap Editor Setup
```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({ history: false }),
    History.configure({ depth: 100 }),
    // Other extensions...
  ],
  content,
  onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
})
```

### Theme Application
```typescript
const getThemeStyles = (themeStyles) => `
  .tiptap-editor .ProseMirror h1 {
    ${themeStyles.h1 ? tailwindToCSS(themeStyles.h1) : ''}
  }
`
```

### Change Tracking
```typescript
const handleEditorChange = (content) => {
  setEditorContent(content)
  const hasChanges = content !== originalContent
  setHasUnsavedChanges(hasChanges)
}
```