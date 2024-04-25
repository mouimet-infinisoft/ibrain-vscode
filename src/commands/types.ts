import * as vscode from 'vscode';

export type ICommand<T = any, R = any> = {
    name: string
    callback: (context: vscode.ExtensionContext) => (...args: T[]) => R
};