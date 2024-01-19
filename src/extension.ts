/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import * as vscode from "vscode";
import * as eventHandlers from "./eventHandlers";

export async function activate(context: vscode.ExtensionContext) {
	console.log("\"Blameem\" has been activated!");
	eventHandlers.activate();
}
