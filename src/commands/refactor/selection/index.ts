import * as vscode from "vscode";
import { ICommand } from "../../types";
import { logger } from "../../../services/logger";
import { AIIntegration } from "../../../services/ai";

export const selection: ICommand = {
  name: "ibrain-vscode.refactor.selection",
  callback: (context: vscode.ExtensionContext) => async (uri: vscode.Uri) => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      logger.verbose("Selected text: " + selectedText);
      context.workspaceState.update(
        "ibrain-vscode.refactor.selection",
        selectedText
      );

      try {
        const ai = AIIntegration.getInstance()
        const answer = await ai.ask([
          {
            role: "user",
            content: `Fix mistakes in the following code: ${selectedText}`,
          },
        ]);
        console.log(answer.choices?.[0]?.message?.content);
      } catch (error: any) {
        vscode.window.showErrorMessage(`Something Went Wong ${error?.message}`);
      }
    } else {
      vscode.window.showErrorMessage("No active editor found.");
    }
  },
};
