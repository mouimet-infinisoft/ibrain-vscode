import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export async function identifyLocalImportsAndConcatenate(
  selectedFile: string
): Promise<string | undefined> {
  if (!selectedFile) {
    vscode.window.showErrorMessage("Please select a file first.");
    return undefined;
  }

  try {
    const fileContent = await fs.promises.readFile(selectedFile, "utf-8");
    const localImportRegex = /from\s+['"](.+?)(?!\.d\.ts)['"]/g; // Excludes .d.ts files

    const processedImports = new Set<string>(); // Keep track of processed imports
    const localImports: Promise<string | undefined>[] = [];

    // Include the content of the selected file with its filename header
    localImports.push(
      Promise.resolve(`// ${path.basename(selectedFile)}\n${fileContent}`)
    );

    const processImport = async (
      importPath: string
    ): Promise<string | undefined> => {
      const absoluteImportPath = path.resolve(
        path.dirname(selectedFile),
        importPath
      );

      if (processedImports.has(absoluteImportPath)) {
        // Skip already processed import to avoid circular dependencies
        return undefined;
      }

      processedImports.add(absoluteImportPath); // Mark import as processed

      try {
        let importContent: string;

        // Check if the import file exists with each possible extension
        const possibleExtensions = [".ts", ".tsx", ".js", ".jsx"]; // Common extensions in TypeScript projects
        for (const ext of possibleExtensions) {
          const fullPath = `${absoluteImportPath}${ext}`;
          if (fs.existsSync(fullPath)) {
            importContent = await fs.promises.readFile(fullPath, "utf-8");
            return `// ${path.relative(
              path.dirname(selectedFile),
              fullPath
            )}\n${importContent}`;
          }
        }

        // If the import is a folder, try adding /index.js, /index.jsx, /index.ts, or /index.tsx
        if (fs.lstatSync(absoluteImportPath).isDirectory()) {
          for (const indexExt of possibleExtensions) {
            const indexFullPath = `${absoluteImportPath}/index${indexExt}`;
            if (fs.existsSync(indexFullPath)) {
              importContent = await fs.promises.readFile(
                indexFullPath,
                "utf-8"
              );
              return `// ${path.relative(
                path.dirname(selectedFile),
                indexFullPath
              )}\n${importContent}`;
            }
          }
        }

        // If no matching file found, show a warning message
        vscode.window.showWarningMessage(
          `Import file "${absoluteImportPath}" not found.`
        );
        return undefined;
      } catch (error) {
        vscode.window.showWarningMessage(
          `Error accessing file "${absoluteImportPath}": ${
            (error as Error).message
          }`
        );
        return undefined;
      }
    };

    // Iterate through matches and process imports using promises
    for (const match of fileContent.matchAll(localImportRegex)) {
      const importPath = match[1];
      localImports.push(processImport(importPath));
    }

    // Wait for all promises to resolve before concatenation
    const resolvedImports = await Promise.all(localImports);

    return resolvedImports.filter(Boolean).join("\n\n"); // Filter out empty strings and concatenate
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Error reading file "${selectedFile}": ${error.message}`
    );
    return undefined;
  }
}
