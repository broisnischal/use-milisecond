import * as vscode from "vscode";

export function isCursorInsideJSXElement(): boolean {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return false;
  }

  const document = editor.document;
  const currentPosition = editor.selection.active;

  const line = document.lineAt(currentPosition.line);

  const openBracketIndex = line.text.lastIndexOf("<", currentPosition.character);
  const closeBracketIndex = line.text.indexOf(">", currentPosition.character);

  if (openBracketIndex === -1 || closeBracketIndex === -1 || closeBracketIndex < openBracketIndex) {
    return false;
  }

  const elementName = line.text.substring(openBracketIndex + 1, closeBracketIndex);

  return /^[A-Z]/.test(elementName);
}

export function isCursorInsideJSX(): boolean {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return false;
  }

  const document = editor.document;
  const cursorPosition = editor.selection.active;

  for (let i = 0; i <= cursorPosition.line; ++i) {
    const line = document.lineAt(i);

    const openBracketIndex = line.text.lastIndexOf("<", cursorPosition.character);
    const closeBracketIndex = line.text.indexOf(">", cursorPosition.character);

    if (openBracketIndex === -1 || closeBracketIndex === -1 || closeBracketIndex < openBracketIndex) {
      continue;
    }

    const elemName = line.text.substring(openBracketIndex + 1, closeBracketIndex);

    if (/^[A-Za-z]/.test(elemName)) {
      return true;
    }
  }

  return false;
}
