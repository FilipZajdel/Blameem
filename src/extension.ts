
import * as vscode from "vscode";
import * as eventHandlers from "./eventHandlers";

export async function activate(context: vscode.ExtensionContext) {
	console.log("\"Codeowlers\" has been activated!");
	eventHandlers.activate();
}
