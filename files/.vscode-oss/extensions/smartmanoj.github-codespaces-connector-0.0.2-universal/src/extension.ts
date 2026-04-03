import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function isGhInstalled(callback: (installed: boolean) => void) {
  exec('gh --version', (err) => {
    callback(!err);
  });
}


export async function activate(context: vscode.ExtensionContext) {
  isGhInstalled((installed) => {
    if (!installed) {
      vscode.window.showErrorMessage(
        'GitHub CLI (`gh`) is not installed. Please install it from [https://cli.github.com/](https://cli.github.com/) and authenticate using `gh auth login`.',
      );
      return;
    }
  });

  const connectDisposable = vscode.commands.registerCommand('codespaces.connect', async () => {
    exec('gh codespace list --json name,repository', (err, stdout) => {
      if (err) {
        vscode.window.showErrorMessage('Failed to fetch codespaces.');
        return;
      }

      const codespaces: {name: string, repository: string}[] = JSON.parse(stdout);
      const quickPickItems = codespaces.map(cs => ({ label: cs.name, detail: cs.repository, repository: cs.repository }));

      vscode.window.showQuickPick(quickPickItems).then((selection) => {
        if (selection) {
          const selectedCodespace = selection.label;
          const repoName = selection.repository.replace('/', '-');

          vscode.window.showInformationMessage(`Fetching SSH config for ${selectedCodespace}...`);
          exec(`gh codespace ssh --config -c ${selectedCodespace}`, (err, sshConfigOutput) => {
            if (err) {
              vscode.window.showErrorMessage(`Failed to get SSH config for ${selectedCodespace}.`);
              return;
            }
            
            const sshConfigPath = path.join(os.homedir(), '.ssh', 'config');
            const sshDir = path.dirname(sshConfigPath);

            if (!fs.existsSync(sshDir)) {
                fs.mkdirSync(sshDir, { recursive: true });
            }

            if (!fs.existsSync(sshConfigPath)) {
                fs.writeFileSync(sshConfigPath, '');
            }

            let sshConfigFileContent = fs.readFileSync(sshConfigPath, 'utf8');
            
            const beginMarker = `# BEGIN GITHUB CODESPACES CONFIG FOR ${selectedCodespace}`;
            const endMarker = `# END GITHUB CODESPACES CONFIG FOR ${selectedCodespace}`;
            const escapedBeginMarker = beginMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedEndMarker = endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\s*${escapedBeginMarker}[\\s\\S]*?${escapedEndMarker}\\s*`, 'g');
            sshConfigFileContent = sshConfigFileContent.replace(regex, '');

            const modifiedSshConfig = sshConfigOutput.replace(/^(Host\s+).*/m, `$1${repoName}`);
            const finalConfigContent = `${beginMarker}\n${modifiedSshConfig}\n${endMarker}\n\n${sshConfigFileContent}`;

            fs.writeFileSync(sshConfigPath, finalConfigContent);
            
            const simpleRepoName = repoName.split('-')[1];
            const folderUri = vscode.Uri.parse(`vscode-remote://ssh-remote+${repoName}/workspaces/${simpleRepoName}`);
            vscode.commands.executeCommand('vscode.openFolder', folderUri, { forceNewWindow: true });
          });
        }
      });
    });
  });

  context.subscriptions.push(connectDisposable);
}