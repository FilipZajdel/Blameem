
import * as vscode from "vscode";
import * as eventHandlers from "./eventHandlers";
import { view } from "./view"


export async function activate(context: vscode.ExtensionContext) {
	view.activate();
	eventHandlers.activate();
}
