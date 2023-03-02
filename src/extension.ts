import moment = require('moment');
import * as vscode from 'vscode';

function parseTimeString(timeString: string): Thenable<string | undefined> | number {
    const timeUnits: Record<string, number> = {
        year: moment.duration(1, 'year').asMilliseconds(),
        yr: moment.duration(1, 'year').asMilliseconds(),
        mon: moment.duration(1, 'month').asMilliseconds(),
        week: moment.duration(1, 'week').asMilliseconds(),
        day: moment.duration(1, 'day').asMilliseconds(),
        hour: 60 * 60 * 1000,
        hr: 60 * 60 * 1000,
        min: 60 * 1000,
        sec: 1000,
    };

    const timeValues: Record<string, number> = { year: 0, yr: 0, mon: 0, week: 0, day: 0, hour: 0, hr: 0, min: 0, sec: 0 };

    // Extract the time unit and value from the input string
    const regex = /(\d+)\s*(year|yr|mon|week|day|hour|hr|min|sec)/gi;
    let match;

    while ((match = regex.exec(timeString)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];

        timeValues[unit] = value;
    }

    let totalMilliseconds = 0;

    for (const unit in timeUnits) {
        totalMilliseconds += timeUnits[unit] * timeValues[unit];
    }

    return totalMilliseconds;
}

let usedHistory: (number | string | Thenable<string | undefined>)[] = [];

export function activate(context: vscode.ExtensionContext) {
    // console.log('Use second is now active!');

    // let disposable = vscode.commands.registerCommand('time.useMilisecond', async () => {
    //     // vscode.window.showQuickPick(options);
    //     // await getUserSelectedValue(options);
    //     const choosed = await convertTimeToSecond(options);
    //
    // });

    let disposable = vscode.commands.registerCommand('millisecond.useMilliseconds', () => {
        function toStr(arr: any[]) {
            let txt = '';
            arr.map((i) => {
                txt += ` ${i}, `;
            });

            let trunked = txt.slice(0, -1);

            if (trunked.endsWith(' ')) {
                trunked = trunked.trimEnd().slice(0, -1);
            }
            if (trunked.endsWith(',')) {
                trunked = trunked.trimEnd().slice(0, -1);
            }

            trunked += '...';
            return trunked;
        }

        let searches: [] = context.workspaceState.get('searches') ?? [];

        let placeHolderStr = usedHistory.length > 2 ? `Your searches : ${toStr(Array.from(searches))}` : `7 day, 45 minute, 2year, 1hr15min20sec, 1year 2week 3mon 14 hr 12 min 10sec `;
        vscode.window
            .showInputBox({
                prompt: 'Enter to convert into millisecond ?',
                value: '',
                placeHolder: placeHolderStr,
            })
            .then((val) => {
                if (val === undefined || parseInt(val) === 27 || val === null) {
                    return;
                } else {
                    if (!val) {
                        return;
                    } else {
                        let passvalue = val.replace(/(and)[\s,.]+/gi, '');
                        let second: number | Thenable<string | undefined>;

                        if (!String(passvalue).match(/[^a-zA-Z0-9, ]/g)) {
                            let timeInMiliSeconds: any;
                            if (String(passvalue).match(/^\d+$/)) {
                                // passvalue += 'sec';
                                // second = parseTimeString(passvalue);
                                // console.log(passvalue);
                                timeInMiliSeconds = parseTimeString(passvalue + 'sec');
                            } else {
                                timeInMiliSeconds = parseTimeString(passvalue);
                            }

                            if (timeInMiliSeconds === 0 || timeInMiliSeconds === undefined) {
                                return vscode.window.showErrorMessage('Millisecond : Please provide valid Input!');
                            }

                            usedHistory.unshift(val);

                            if (usedHistory.length > 5) {
                                usedHistory.pop();
                            }

                            // vscode.window.showQuickPick(usedHistory);

                            const editor = vscode.window.activeTextEditor;
                            if (timeInMiliSeconds.toString() !== 'NaN') {
                                if (editor) {
                                    const fileExtension = editor.document.fileName.split('.').pop()?.toLowerCase();
                                    const selection = editor.selection;
                                    const text = editor.document.getText(selection);
                                    editor
                                        .edit((editBuilder) => {
                                            const position = editor.selection.active;
                                            const currentPosition = editor.selection.active;

                                            if (text) {
                                                return editBuilder.replace(selection, timeInMiliSeconds.toString() + ' ');
                                            }

                                            // saves history
                                            context.workspaceState.update('searches', usedHistory);

                                            if (currentPosition.character === 0) {
                                                return editBuilder.insert(position, timeInMiliSeconds.toString() + ' ');
                                            } else {
                                                const previousPosition = currentPosition.with(undefined, currentPosition.character - 1);
                                                const previousCharacter = editor.document.getText(new vscode.Range(previousPosition, currentPosition));

                                                if (previousCharacter === ' ') {
                                                    return editBuilder.insert(position, timeInMiliSeconds.toString() + ' ');
                                                } else {
                                                    return editBuilder.insert(position, ' ' + timeInMiliSeconds.toString() + ' ');
                                                }
                                            }
                                        })
                                        .then(() => {
                                            const newPosition = selection.active.with(undefined, editor.document.lineAt(selection.active.line).range.end.character);
                                            editor.selection = new vscode.Selection(newPosition, newPosition);
                                            editor
                                                .edit((editBuilder) => {
                                                    const lineEnd = editor.document.lineAt(selection.active.line).range.end.character;
                                                    let comment: string = '';
                                                    console.log(fileExtension);

                                                    switch (fileExtension) {
                                                        case 'js':
                                                            comment = '// ' + usedHistory[0];
                                                            break;
                                                        case 'ts':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'html':
                                                            comment = ` <!-- ${usedHistory[0]} -->`;
                                                            break;
                                                        case 'css':
                                                            comment = ` /* ${usedHistory[0]} */`;
                                                            break;
                                                        case 'py':
                                                            comment = ` # ${usedHistory[0]}`;
                                                            break;
                                                        case 'rb':
                                                            comment = ` # ${usedHistory[0]}`;
                                                            break;
                                                        case 'php':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'java':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'c':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'cpp':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'swift':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'go':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'csharp':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'vb':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'scala':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'rust':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        case 'kotlin':
                                                            comment = ` // ${usedHistory[0]}`;
                                                            break;
                                                        default:
                                                            comment = '';
                                                            break;
                                                    }

                                                    editBuilder.insert(new vscode.Position(selection.active.line, lineEnd), comment);
                                                })
                                                .then(() => {
                                                    const newPosition = selection.active.with(undefined, editor.document.lineAt(selection.active.line).range.end.character);
                                                    editor.selection = new vscode.Selection(newPosition, newPosition);
                                                });
                                        });
                                } else {
                                    vscode.env.clipboard.writeText(timeInMiliSeconds.toString());
                                    return vscode.window.showInformationMessage('Copied : Time in milliseconds is ' + timeInMiliSeconds + '.');
                                }
                            } else {
                                return vscode.window.showErrorMessage('Invalid Input, pass 1 day 10 hr 30 min etc...');
                            }
                        } else {
                            return vscode.window.showErrorMessage('Millisecond: Invalid Symbols in Input!');
                        }
                    }
                }
            });
    });

    context.subscriptions.push(disposable);
}
const convertTimeToSecond = async (options: any[]) => {
    return new Promise((resolve) => {
        const option = vscode.window.showQuickPick(options, {
            matchOnDescription: true,
            placeHolder: 'Select to convert your format',
        });
        if (!option) {
            return;
        }

        resolve(option);
    });
};

async function getUserSelectedValue(choices: any[]) {
    return new Promise((resolve) => {
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = choices.map((choice) => ({ label: choice }));

        quickPick.title = 'Select what you want to convert?';

        quickPick.onDidChangeValue(() => {
            if (!choices.includes(quickPick.value)) {
                quickPick.items = [quickPick.value, ...choices].map((label) => ({ label }));
            }
        });

        quickPick.onDidAccept(() => {
            const selection = quickPick.activeItems[0];
            resolve(selection.label);
            quickPick.hide();
        });
        quickPick.show();
    });
}

export function deactivate() {
    // console.log('Extension is Inactive now!');
}
