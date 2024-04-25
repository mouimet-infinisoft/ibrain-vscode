import * as vscode from 'vscode';
import OpenAi from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { fsTool } from './tools/fs';

export class AIIntegration {
    private static instance: AIIntegration | null = null;
    private aiIntegration: OpenAi | null = null;
    private model: string | undefined;

    private constructor() {
        const configuration = vscode.workspace.getConfiguration('ibrain-vscode.ai');
        const baseURL = configuration.get<string>('baseUrl');
        const apiKey = configuration.get<string>('apiKey');
        this.model = configuration.get<string>('model');

        if (!apiKey) {
            vscode.window.showWarningMessage('API key is not defined. Please configure it in your settings.');
            vscode.commands.executeCommand('workbench.action.openSettings', 'ibrain-vscode.ai.apiKey');
        } else if (!this.model) {
            vscode.window.showWarningMessage('AI Model is not defined. Please configure it in your settings.');
            vscode.commands.executeCommand('workbench.action.openSettings', 'ibrain-vscode.ai.model');
        } else {
            this.aiIntegration = new OpenAi({
                baseURL,
                apiKey,
                dangerouslyAllowBrowser: true
            });
        }
    }

    public static getInstance(): AIIntegration {
        if (!AIIntegration.instance) {
            AIIntegration.instance = new AIIntegration();
        }
        return AIIntegration.instance;
    }

    public async askWithTools(messages: Array<ChatCompletionMessageParam>) {
        if (!this.aiIntegration || !this.model) {
            throw new Error('AI integration is not properly initialized.');
        }
        return this.aiIntegration.chat.completions.create({
            model: this.model,
            messages,
            temperature: 0.8,
            tool_choice:'auto',
            tools:[fsTool]
        });
    }

    public async ask(messages: Array<ChatCompletionMessageParam>) {
        if (!this.aiIntegration || !this.model) {
            throw new Error('AI integration is not properly initialized.');
        }
        return this.aiIntegration.chat.completions.create({
            model: this.model,
            messages
        });
    }

    public getClient(): OpenAi | null {
        return this.aiIntegration;
    }
}
