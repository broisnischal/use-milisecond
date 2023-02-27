import * as vscode from 'vscode';

function parseTimeString(timeString: string): Thenable<string | undefined> | number {
    const timeUnits: Record<string, number> = {
        year: 2629746000 * 12,
        mon: 2629746000 * 1,
        week: 604800000,
        day: 24 * 60 * 60 * 1000,
        hr: 60 * 60 * 1000,
        min: 60 * 1000,
        sec: 1000,
    };

    const timeValues: Record<string, number> = { year: 0, mon: 0, week: 0, day: 0, hr: 0, min: 0, sec: 0 };

    // Extract the time unit and value from the input string
    const regex = /(\d+)\s*(year|mon|week|day|hour|hr|min|sec)/gi;
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

let usedHistory: (number | Thenable<string | undefined>)[] = [];

export function activate(context: vscode.ExtensionContext) {
    console.log('Use second is now active!');

    // let disposable = vscode.commands.registerCommand('time.useMilisecond', async () => {
    //     // vscode.window.showQuickPick(options);
    //     // await getUserSelectedValue(options);
    //     const choosed = await convertTimeToSecond(options);
    //     console.log(choosed);
    // });

    let disposable = vscode.commands.registerCommand('millisecond.useMilliseconds', () => {
        vscode.window
            .showInputBox({
                prompt: 'Enter to convert into millisecond ?',
                value: '',
                placeHolder: '7 day, 45 minute, 2year, 1hr15min20sec, 1year 2week 3mon 14 hr 12 min 10sec ',
            })
            .then((val) => {
                if (val === undefined || parseInt(val) === 27 || val === null) {
                    return;
                } else {
                    if (!val) {
                        return;
                    } else {
                        let passvalue = val.replace(/[\s,.]+/g, '');
                        const timeInMiliSeconds = parseTimeString(passvalue);

                        if (timeInMiliSeconds === 0 || timeInMiliSeconds === undefined) {
                            return vscode.window.showErrorMessage('Millisecond : Please provide valid Input!');
                        }

                        usedHistory.unshift(timeInMiliSeconds);

                        if (usedHistory.length > 5) {
                            usedHistory.pop();
                        }

                        // vscode.window.showQuickPick(usedHistory);

                        const editor = vscode.window.activeTextEditor;
                        if (timeInMiliSeconds.toString() !== 'NaN') {
                            if (editor) {
                                editor.edit((editBuilder) => {
                                    const position = editor.selection.active;
                                    const currentPosition = editor.selection.active;

                                    if (currentPosition.character === 0) {
                                        // console.log('here');
                                        return editBuilder.insert(position, timeInMiliSeconds.toString());
                                    } else {
                                        // console.log('there');
                                        const previousPosition = currentPosition.with(undefined, currentPosition.character - 1);
                                        const previousCharacter = editor.document.getText(new vscode.Range(previousPosition, currentPosition));

                                        if (previousCharacter === ' ') {
                                            return editBuilder.insert(position, timeInMiliSeconds.toString());
                                            // vscode.window.showInformationMessage('Previous character is a space');
                                        } else {
                                            return editBuilder.insert(position, ' ' + timeInMiliSeconds.toString());
                                            // vscode.window.showInformationMessage('Previous character is not a space');
                                        }
                                    }
                                });
                            }
                        } else {
                            return vscode.window.showErrorMessage('Invalid Input, pass 1 day 10 hr 30 min etc...');
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

// export const dayToMS = (val: number) => 86400000 * val;
// export const hrToMS = (val: number) => 60 * 60 * 1000 * val;
// export const minToMS = (val: number) => 60 * 1000 * val;
// export const secToMS = (val: number) => 1000 * val;

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
    console.log('Extension is Inactive now!');
}
