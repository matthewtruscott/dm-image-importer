import * as vscode from 'vscode'
import * as path from 'path'

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand(
		'extension.imageImport',
		async () => {
			// Get the active text editor
			const editor = vscode.window.activeTextEditor
			if (editor) {
				// Get the selected text or use 'image' as default
				const selectedText = editor.selection.isEmpty
					? 'image'
					: editor.document.getText(editor.selection)

				// Retrieve the configured image path
				const config = vscode.workspace.getConfiguration('imageImporter')
				const defaultImagePath =
					config.get<string>('defaultImagePath') || 'src/images'

				const workspaceFolders = vscode.workspace.workspaceFolders
				let defaultUri = workspaceFolders
					? vscode.Uri.joinPath(workspaceFolders[0].uri, defaultImagePath)
					: null

				// Show open dialog to select an image
				const fileUri = await vscode.window.showOpenDialog({
					canSelectMany: false,
					openLabel: 'Select Image',
					filters: {
						Images: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
					},
					defaultUri: defaultUri as vscode.Uri,
				})

				if (fileUri && fileUri[0]) {
					// Get the path of the selected image
					const imagePath = fileUri[0].fsPath

					// Convert backslashes to forward slashes for cross-platform compatibility
					const relativePath = path.relative(
						path.dirname(editor.document.uri.fsPath),
						imagePath,
					)
					const posixPath = relativePath.split(path.sep).join(path.posix.sep)

					// Create the import statement
					const importStatement = `import ${selectedText} from '${posixPath}';\n`

					// Insert the import at the top of the file
					const firstLine = editor.document.lineAt(0)
					editor.edit((editBuilder) => {
						editBuilder.insert(firstLine.range.start, importStatement)
					})
				}
			}
		},
	)

	context.subscriptions.push(disposable)
}

export function deactivate() {}
