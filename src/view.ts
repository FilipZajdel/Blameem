/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import * as vscode from "vscode";
import { FileParticipants } from "./models";

class GithubParticipant {
  private _repr: string;
  private _avatarDimensions = { width: 25, height: 25 };

  constructor(nickname: string) {
    this._repr = `<img src=https://github.com/${nickname}.png width=${this
      ._avatarDimensions.width} height=${this._avatarDimensions
      .height}>  <a href=https://github.com/${nickname}>${nickname}</a>`;
  }

  asString(): string {
    return this._repr;
  }
}

class OwnersTooltip {
  private _statusBarItem: vscode.StatusBarItem;

  constructor(_statusBarItem: vscode.StatusBarItem) {
    this._statusBarItem = _statusBarItem;
    this._statusBarItem.tooltip = new vscode.MarkdownString();
    this._statusBarItem.tooltip.supportHtml = true;
  }

  set participants(participants: FileParticipants) {
    const mapNick = (nickname: string) =>
      new GithubParticipant(nickname).asString();
    const maintainers = participants.maintainers.map(mapNick).join("\n\n");
    const collaborators = participants.collaborators.map(mapNick).join("\n\n");

    const mdTooltip = new vscode.MarkdownString();
    mdTooltip.supportHtml = true;

    if (collaborators.length > 0) {
      mdTooltip.appendMarkdown(`### Maintainers\n${collaborators}\n`);
    }

    if (maintainers.length > 0) {
      mdTooltip.appendMarkdown(`### Collaborators\n${maintainers}\n`);
    }

    this._statusBarItem.tooltip = mdTooltip;
  }

  clear() {
    if (!this._statusBarItem) {
      return;
    }

    this._statusBarItem.tooltip = new vscode.MarkdownString();
  }
}

export class View {
  _statusBarItem: vscode.StatusBarItem | undefined = undefined;
  tooltip: OwnersTooltip;

  constructor(size: number = 300) {
    this._statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      size
    );
    this._statusBarItem.text = "$(mark-github)";
    this.tooltip = new OwnersTooltip(this._statusBarItem);
  }

  update(owners: FileParticipants) {
    if (!this._statusBarItem) {
      return;
    }

    if (owners.maintainers.length > 0 || owners.collaborators.length > 0) {
      this.tooltip.clear();
      this.tooltip.participants = owners;
      this._statusBarItem.show();
    } else {
      this._statusBarItem.hide();
    }
  }
}

export let view = new View();
