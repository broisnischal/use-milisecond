import * as vscode from 'vscode';

interface Options {
    label: String;
    detail: String;
    type: String;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Use second is now active!');
    let options = [
        {
            label: 'sec',
            detail: 'second sec',
            type: 'second',
        },
        {
            label: 'min',
            detail: 'minute min',
            type: 'minute',
        },
        {
            label: 'hr',
            detail: 'hours hr hrs',
            type: 'second',
        },
        {
            label: 'day',
            detail: 'day days',
            type: 'day',
        },
    ];
    // let disposable = vscode.commands.registerCommand('time.useMilisecond', async () => {
    //     // vscode.window.showQuickPick(options);
    //     // await getUserSelectedValue(options);
    //     const choosed = await convertTimeToSecond(options);
    //     console.log(choosed);
    // });

    let disposable = vscode.commands.registerCommand('time.useMilisecond', () => {
        vscode.window
            .showInputBox({
                prompt: 'Time to convert into milisecond ?',
                value: '',
                placeHolder: '7 day, 45 minute, 2 year,  1hr15min20sec, ',
            })
            .then((val) => {
                if (val === undefined) {
                    vscode.window.showErrorMessage('Invalid Input, Please enter correct format! ');
                } else {
                    // 1 second = 1000 miliseconds
                    // 1 minute = (60000) miliseconds - 60 * 1000
                    // 1 hour = 3600000 miliseconds - 60 * 60 *1000 = 3600000
                    // 1 day to miliseconds
                    // 1 week to miliseconds
                    // 1 month to miliseconds
                    // 1 year to miliseconds

                    if (!val) {
                        return;
                    } else {
                        const opt = ['sec', 'min', 'hr', 'day']; // 'mon', 'week', 'year'

                        let nums = {
                            sec: 0,
                            min: 0,
                            hr: 0,
                            day: 0,
                        };

                        const input = val.replace(/\s/g, '');

                        const items = val.split(' ');
                        console.log(items);

                        const timeInMiliSeconds = parseInt(val) * 1000;

                        const editor = vscode.window.activeTextEditor;
                        if (timeInMiliSeconds.toString() !== 'NaN') {
                            if (editor) {
                                editor.edit((editBuilder) => {
                                    const position = editor.selection.active;
                                    editBuilder.insert(position, timeInMiliSeconds.toString());
                                });
                            }
                        } else {
                            return vscode.window.showErrorMessage('Invalid Input, pass 1 day, 10 hr, 30 min etc...');
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

export const dayToMS = (val: number) => 86400000 * val;
export const hrToMS = (val: number) => 60 * 60 * 1000 * val;
export const minToMS = (val: number) => 60 * 1000 * val;
export const secToMS = (val: number) => 1000 * val;

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
