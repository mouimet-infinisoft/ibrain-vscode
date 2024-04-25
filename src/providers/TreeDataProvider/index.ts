import * as vscode from "vscode";

enum TreeNodeType {
  category,
  item,
}

export class IBrainTreeProvider
  implements vscode.TreeDataProvider<ITreeNode>
{
  onDidChangeTreeData?:
    | vscode.Event<void | ITreeNode | null | undefined>
    | undefined;

  getTreeItem(element: ITreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(element?: ITreeNode): vscode.ProviderResult<ITreeNode[]> {
    if (element) {
      return element.children;
    }

    return [
      new TreeNode(
        "root",
        "Transform",
        vscode.TreeItemCollapsibleState.Expanded,
        TreeNodeType.category,
        [
          new TreeNode(
            "2222",
            "Json2Ts",
            vscode.TreeItemCollapsibleState.None,
            TreeNodeType.item,
            []
          ),
          new TreeNode(
            "233",
            "Json2S",
            vscode.TreeItemCollapsibleState.None,
            TreeNodeType.item,
            []
          ),
        ]
      ),
    ];
  }
}

interface ITreeNode extends vscode.TreeItem {
  id: string;
  label: string;
  collapsibleState: vscode.TreeItemCollapsibleState;
  type: TreeNodeType;
  command?: vscode.Command;
  children: ITreeNode[];
}

class TreeNode extends vscode.TreeItem implements ITreeNode {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly type: TreeNodeType,
    public readonly children: ITreeNode[]
  ) {
    super(label, collapsibleState);
  }

  // command?: vscode.Command | undefined;
  // iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; } | vscode.ThemeIcon | undefined;
  // description?: string | boolean | undefined;
  // resourceUri?: vscode.Uri | undefined;
  // tooltip?: string | vscode.MarkdownString | undefined;
  // contextValue?: string | undefined;
  // accessibilityInformation?: vscode.AccessibilityInformation | undefined;
}
