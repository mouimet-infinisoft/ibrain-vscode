import * as vscode from "vscode";
import { ICommand } from "../../types";
import { identifyLocalImportsAndConcatenate } from "./identifyLocalImportsAndConcatenate";
import { logger } from "../../../services/logger";

export const file: ICommand = {
  name: "ibrain-vscode.refactor.file",
  callback: (context: vscode.ExtensionContext) => async (uri: vscode.Uri) => {
    if (!uri || !uri.fsPath) {
      return vscode.window.showErrorMessage("Invalid file selected.");
    }

    const selectedFile = uri.fsPath;
    const concatenatedContent = await identifyLocalImportsAndConcatenate(
      selectedFile
    );
    if (concatenatedContent) {
      logger.verbose(concatenatedContent);
      context.workspaceState.update(
        "ibrain-vscode.refactor.file",
        concatenatedContent
      );
    }
  },
};
