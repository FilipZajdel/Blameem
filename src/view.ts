/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import * as vscode from "vscode";
import { FileParticipants } from "./models";

class OwnersTooltip {
    private statusBarItem: vscode.StatusBarItem;

    constructor(statusBarItem: vscode.StatusBarItem) {
        this.statusBarItem = statusBarItem;
        this.statusBarItem.tooltip = new vscode.MarkdownString();
        this.statusBarItem.tooltip.supportHtml = true;
    }

    set collaborators(collaborators: string[]) {
        if (collaborators.length === 0) {
            return;
        }

        let newTooltip = new vscode.MarkdownString();

        newTooltip.value = "## Collaborators:";
        newTooltip.appendText("\n");

        for (let link of collaborators.map((nickname) => `https://github.com/${nickname}`)) {
            newTooltip.appendMarkdown(` * ${link}\n`);
        }

        this.statusBarItem.tooltip = newTooltip;
    }

    set maintainers(maintainers: string[]) {
        if (maintainers.length === 0) {
            return;
        }

        let tooltip = (this.statusBarItem.tooltip instanceof vscode.MarkdownString) ?
            this.statusBarItem.tooltip : new vscode.MarkdownString();

        tooltip.appendMarkdown("## Maintainers:");
        tooltip.appendText("\n");

        for (let link of maintainers.map((nickname) => `https://github.com/${nickname}`)) {
            tooltip.appendMarkdown(` * ${link}\n`);
        }

        this.statusBarItem.tooltip = tooltip;
    }

    clear() {
        if (!this.statusBarItem) {
            return;
        }

        this.statusBarItem.tooltip = new vscode.MarkdownString();
    }
}

export class View {
    statusBarItem: vscode.StatusBarItem | undefined = undefined;
    tooltip: OwnersTooltip;

    constructor(size: number = 100) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, size);
        this.statusBarItem.text = "$(mark-github)";
        this.tooltip = new OwnersTooltip(this.statusBarItem);
    }

    update(owners: FileParticipants) {
        if (!this.statusBarItem) {
            return;
        }

        if (owners.maintainers.length > 0 || owners.collaborators.length > 0) {
            this.tooltip.clear();
            this.tooltip.collaborators = owners.collaborators;
            this.tooltip.maintainers = owners.maintainers;
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }
}

export let view = new View();
