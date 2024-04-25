import { ICommand } from "../types";
import * as vscode from 'vscode';

export const clear: ICommand = {
    name: 'ibrain-vscode.state.clear',
    callback: (context: vscode.ExtensionContext) => () => {
      context.workspaceState.update('ibrain-vscode.refactor.file', undefined);
      context.workspaceState.update('ibrain-vscode.refactor.selection', undefined);
    },
  };