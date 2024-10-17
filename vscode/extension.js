const vscode = require('vscode');
const WebSocket = require('ws');

var wss = null;
var enable = false;
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.reloader', function () {
        if (!enable) {
            enable = !enable;
            if (!wss) {
                wss = new WebSocket.Server({ port: 43902 });
            }

            if (wss) {
                vscode.window.showInformationMessage('Server is START!');
                
                wss.on('connection', (ws) => {
                    console.log("client is connected");
                    
                    // send reload if file saved
                    let onSaveCleaner = vscode.workspace.onDidSaveTextDocument((e) => {
                        console.log('saved ', e);
                        ws.send('reload');
                    });
                    context.subscriptions.push(onSaveCleaner);
        
                });
            }

        } else {
            enable = !enable;
            if (wss) {
                wss.clients.forEach((ws) => {
                    // Soft close
                    ws.close();
            
                    process.nextTick(() => {
                        if ([ws.OPEN, ws.CLOSING].includes(ws.readyState)) {
                            // Socket still hangs, hard close
                            ws.terminate();
                        }
                    });
                });
                wss.close();
                wss = null;
                vscode.window.showInformationMessage('Server is STOP!');
            }
        }
        console.log(wss);    
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;


function deactivate() {}
exports.deactivate = deactivate;
