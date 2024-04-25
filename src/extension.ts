import * as vscode from "vscode";
import { commands } from "./commands";
import { logger } from "./services/logger";
import ChatWebview from "./webviews/ChatWebview";
import { IBrainTreeProvider } from "./providers/TreeDataProvider";

export function activate(context: vscode.ExtensionContext) {
  logger.info("ibrain-vscode extension is now active!");

  context.subscriptions.push(
    vscode.commands.registerCommand(
      commands.refactor.selection.name,
      commands.refactor.selection.callback(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      commands.refactor.file.name,
      commands.refactor.file.callback(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      commands.state.clear.name,
      commands.state.clear.callback(context)
    )
  );

  context.subscriptions.push(vscode.window.registerTreeDataProvider('ibrain-one.view.projects', new IBrainTreeProvider()));

  const webviewPanel = vscode.window.createWebviewPanel(
    'myChatWebview',
    'iBrain One Chat',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  const chatWebview = new ChatWebview(webviewPanel.webview, context);
  chatWebview.init();

  context.subscriptions.push(webviewPanel);
}

// This method is called when your extension is deactivated
export function deactivate() {}
