import { ExtensionContext, commands, window, TextEditor, Range, Selection } from 'vscode';

export function activate(context: ExtensionContext) {

	let disposable = commands.registerCommand('extension.sort-array', () => {
		const editor = window.activeTextEditor;
		if (!editor) { return; }
		const selectionStr: string = editor.document.getText(new Range(editor.selection.start, editor.selection.end));
		const arr = getArray(selectionStr);
		replaceArray(editor, editor.selection, `[${arr.join(',')}]`);
	});

	context.subscriptions.push(disposable);
}

function getArray(selectionStr: string): Array<string> {
	const match: RegExpMatchArray | null = selectionStr.match(/\[((.*\n*\s*)+)\]/m);
	if (!match) { return []; };

	const matchStr = match[1];

	const rootCommaIdxList: Array<number> = [];
	let backQuoteCeption = 0;
	let singleQuoteCeption = 0;
	let doubleQuoteCeption = 0;
	let curlyBracesCeption = 0;
	let bracketsCeption = 0;
	let parenthesesCeption = 0;

	for (let idx = 0; idx < matchStr.length; idx += 1) {
		const currChar = matchStr[idx];
		switch (currChar) {
			case ',':
				if (!backQuoteCeption && !singleQuoteCeption && !doubleQuoteCeption && !curlyBracesCeption && !bracketsCeption && !parenthesesCeption) { rootCommaIdxList.push(idx); }
				break;
			case '\`':
				if (backQuoteCeption % 2 === 0) { backQuoteCeption += 1; }
				else {
					backQuoteCeption -= 1;
				}
				break;
			case '\'':
				if (singleQuoteCeption % 2 === 0) { singleQuoteCeption += 1; }
				else {
					singleQuoteCeption -= 1;
				}
				break;
			case '\"':
				if (doubleQuoteCeption % 2 === 0) { doubleQuoteCeption += 1; }
				else {
					doubleQuoteCeption -= 1;
				}
				break;
			case '{':
				curlyBracesCeption += 1;
				break;
			case '}':
				curlyBracesCeption -= 1;
				break;
			case '[':
				bracketsCeption += 1;
				break;
			case ']':
				bracketsCeption -= 1;
				break;
			case '(':
				parenthesesCeption += 1;
				break;
			case ')':
				parenthesesCeption -= 1;
				break;
			default:
				break;
		}
	}
	if (rootCommaIdxList.length === 0) { return []; };

	const strArr: Array<string> = [];
	strArr.push(matchStr.substr(0, rootCommaIdxList[0]));
	for (let idx = 0; idx < rootCommaIdxList.length - 1; idx += 1) {
		strArr.push(matchStr.substr(rootCommaIdxList[idx] + 1, rootCommaIdxList[idx + 1] - rootCommaIdxList[idx] - 1));
	}
	strArr.push(matchStr.substr(rootCommaIdxList[rootCommaIdxList.length - 1] + 1, matchStr.length - rootCommaIdxList[rootCommaIdxList.length - 1] - 1));

	const spaceArr: Array<string> = [];
	for (let idx = 0; idx < strArr.length; idx += 1) {
		const matchSpace: RegExpMatchArray | null = strArr[idx].match(/\n+\s*/);
		if (matchSpace) {
			spaceArr.push(matchSpace[0]);
		} else {
			spaceArr.push('');
		}
	}

	const trimmedArr = strArr.map(it => it.trim());
	const sortedTrimmedStrArr = trimmedArr.sort();
	const sortedStrArr = sortedTrimmedStrArr.map((elt, idx) => spaceArr[idx] + elt);
	return sortedStrArr;
}

function replaceArray(editor: TextEditor, selection: Selection, newString: string) {
	editor.edit(editBuilder => {
		editBuilder.replace(selection, newString);
	});
}

export function deactivate() { }
