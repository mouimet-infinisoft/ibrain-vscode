import { ChatCompletionTool } from "openai/resources/index.mjs";

export const fsTool:ChatCompletionTool =  {
    "type": "function",
    "function": {
      "name": "createFile",
      "description": "Create a new file or overwrite an existing file in the imagination.",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "The file path to write into"
          },
          "content": {
            "type": "string",
            "description": "The content to write"
          }
        },
        "required": ["path", "content"]
      }
    }
  };