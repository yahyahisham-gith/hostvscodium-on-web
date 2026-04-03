# GitHub Codespaces Connector

This Visual Studio Code extension allows you to seamlessly connect to your GitHub Codespaces directly from the editor. It uses the `gh` command-line interface to fetch your active codespaces and establish an SSH connection.

## Features

*   Lists all your active GitHub Codespaces.
*   Allows you to select a codespace to connect to.
*   Automatically configures your SSH settings.
*   Uses the repository name as the SSH host for easy identification.
*   Opens a new VS Code window connected to the selected codespace via Remote-SSH.

## Requirements

*   **Visual Studio Code**: Version 1.72.0 or higher.
*   **GitHub CLI (`gh`)**: You must have the [GitHub CLI](https://cli.github.com/) installed and authenticated. You can install it from the official website and authenticate by running `gh auth login`.
*   **Remote - SSH Extension**: This extension depends on the official [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) extension from Microsoft.

## How to Use

1.  Install the "GitHub Codespaces Connector" extension from the Visual Studio Code Marketplace.
2.  Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
3.  Run the "Connect to GitHub Codespaces" command.
4.  A quick pick menu will appear, listing your available codespaces.
5.  Select the codespace you want to connect to.
6.  A new VS Code window will open, connected to your selected codespace.
