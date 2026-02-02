import { Editor, MarkdownView, Plugin } from "obsidian";

export default class QuickMoves extends Plugin {
	async onload() {
		this.addCommand({
			id: "jump-relative-lines-down",
			name: "Jump down by 5 lines relative to the cursor",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.jumpRelativeLines(editor, 5);
			},
		});

		this.addCommand({
			id: "jump-relative-lines-up",
			name: "Jump up by 5 lines relative to the cursor",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.jumpRelativeLines(editor, -5);
			},
		});

		this.addCommand({
			id: "decrease-headline-level",
			name: "Decrease headline level of selection",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.adjustHeadlineLevel(editor, -1);
			},
		});

		this.addCommand({
			id: "increase-headline-level",
			name: "Increase headline level of selection",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.adjustHeadlineLevel(editor, 1);
			},
		});
	}

	onunload() {}

	jumpRelativeLines(editor: Editor, lineOffset: number) {
		const cursor = editor.getCursor();
		const newLine = cursor.line + lineOffset;
		const lineCount = editor.lineCount();
		editor.setCursor(
			Math.min(Math.max(newLine, 0), lineCount - 1),
			cursor.ch,
		);
	}

	adjustHeadlineLevel(editor: Editor, levelChange: number) {
		// Get the current selection (using this to handle mid-line selections)
		const cursorStart = editor.getCursor("from");
		const selectionStart = {
			line: cursorStart.line,
			ch: 0,
		};
		const cursorEnd = editor.getCursor("to");
		const selectionEnd = {
			line: cursorEnd.line,
			ch: editor.getLine(cursorEnd.line).length,
		};
		const selection = editor.getRange(selectionStart, selectionEnd);

		// Process each line in the selection
		const lines = selection.split("\n");
		const adjustedLines = lines.map((line) => {
			const match = line.match(/^(#{1,6})\s+/);
			if (match) {
				let currentLevel = match[1]!.length;
				let newLevel = Math.min(
					Math.max(currentLevel + levelChange, 1),
					6,
				);
				return line.replace(/^(#{1,6})/, "#".repeat(newLevel));
			} else {
				return line;
			}
		});

		// Replace selection and restore selection for follow-up adjustments
		editor.replaceRange(
			adjustedLines.join("\n"),
			selectionStart,
			selectionEnd,
		);
		editor.setSelection(cursorStart, cursorEnd);
	}
}
