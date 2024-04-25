import * as vscode from "vscode";
import { AIIntegration } from "../services/ai";
import marked from "marked";

interface ChatMessage {
  text: string;
  isUser: boolean;
}

class ChatWebview {
  private webview: vscode.Webview;
  private chatMessages: ChatMessage[];
  private ai: AIIntegration;

  constructor(
    webview: vscode.Webview,
    private context: vscode.ExtensionContext
  ) {
    this.webview = webview;
    this.ai = AIIntegration.getInstance();
    this.chatMessages = new Array<ChatMessage>();
  }

  public init() {
    this.webview.html = this.getWebviewContent();
    this.webview.onDidReceiveMessage(this.handleMessage.bind(this));
  }

  private getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>iBrain One Chat</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif;
          font-size: 1.3rem;
        }
        .chat-message {
          margin-bottom: 10px;
        }
        .chat-input {
          position: fixed;
          bottom: 15px;
          left: 15px;
          width: 88%;
          height: 2.7rem;
          font-size: x-large;
        }
        .chat-button {
          position: fixed;
          bottom: 15px;
          right: 15px;
          width: 8%;
          height: 3rem;
        }
        .chat-card {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 5px;
        }
        .chat-card.is-user {
          background-color: #007acc;
          color: white;
        }
        .chat-card.is-bot {
          background-color: #666;
          color: white;
        }
      </style>
    </head>
    <body>
      <h1>iBrain One Chat</h1>
      <div id="chat-log"></div>
      <input id="message-input" class="chat-input" type="text" placeholder="Type a message...">
      <button id="send-button" class="chat-button">Send</button>
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <script>
        const vscode = acquireVsCodeApi();
        const chatLogElement = document.getElementById('chat-log');
        const messageInputElement = document.getElementById('message-input');
        const sendButtonElement = document.getElementById('send-button');

        sendButtonElement.addEventListener('click', () => {
          const messageText = messageInputElement.value.trim();
          console.log('button click message text: ', messageText)
          if (messageText) {
            vscode.postMessage({ type: 'sendMessage', text: messageText });
            messageInputElement.value = '';
          }
        });

        window.addEventListener('message', event => {
          console.log('vscode.onmessage event: ', event)
          if (event.data.type === 'updateChat') {
            chatLogElement.innerHTML = '';
            event.data.messages.forEach((message) => {
              const chatCardElement = document.createElement('div');
              chatCardElement.className = \`chat-card \${message.isUser ? 'is-user' : 'is-bot'}\`;
              const messageElement = document.createElement('div');
              messageElement.innerHTML =  \`\${message.isUser ? marked.parse('You: ' + message.text) :  marked.parse('iBrain: ' + message.text)}\`;
              chatCardElement.appendChild(messageElement);
              chatLogElement.appendChild(chatCardElement);
            });
          }
        });
      </script>
    </body>
    </html>`;
  }

  private handleMessage(message: any) {
    console.log(`handlemessage : `, message);
    if (message.type === "sendMessage") {
      const userMessage: ChatMessage = {
        text: message.text,
        isUser: true,
      };
      console.log(`handlemessage this : `, this);
      console.log(`handlemessage this.chatMessages : `, this.chatMessages);
      this.chatMessages.push(userMessage);
      this.webview.postMessage({
        type: "updateChat",
        messages: this.chatMessages,
      });

      this.sendToGPT(userMessage.text);
    }
  }

  private sendToGPT(prompt: string) {
    console.log(`sendToGPT: `, prompt);
    console.log(
      `context state: `,
      this.context.workspaceState.get("ibrain-vscode.refactor.file")
    );
    const _contextState = this.context.workspaceState.get(
      "ibrain-vscode.refactor.file"
    );
    this.ai
      .ask([
        {
          role: "user",
          content: `${
            _contextState ? "Code Context: " + _contextState : ""
          } User Message: ${prompt}`,
        },
      ])
      .then((response) => {
        console.log(`response sendToGPT: `, JSON.stringify(response));
        const gptResponse: ChatMessage = {
          text: response?.choices?.[0]?.message?.content ?? "",
          isUser: false,
        };
        this.chatMessages.push(gptResponse);
        this.webview.postMessage({
          type: "updateChat",
          messages: this.chatMessages,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

export default ChatWebview;
