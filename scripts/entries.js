let isCreated = false;

window.addEventListener('load', () => {
    createFeedbackMessage();

    let entries = [];

    const headline = document.getElementById('headline');
    const entriesWrapper = document.getElementById('entriesWrapper');
    const openTransactionWindow = document.getElementById('openTransactionWindow');
    const transactionWindow = document.getElementById('transactionWindow');
    const disableTransactionWindow = document.getElementById('disableTransactionWindow');
    const signOut = document.getElementById('signOut');

    firebase.database().ref('currency').on('value', currency => {
        currency = currency.val();

        firebase.database().ref('entries/').on('value', snapshot => {
            entries = [];

            for (const key in snapshot.val()) {
                entries.push(snapshot.val()[key]);
            }

            for (let i = 0; i < entries.length; i++) {
                for (let j = i; j < entries.length; j++) {
                    if (entries[i].name.toLowerCase() > entries[j].name.toLowerCase()) {
                        const temp = entries[i];
                        entries[i] = entries[j];
                        entries[j] = temp;
                    }
                }
            }

            if (entries.length !== 0) {
                printEntries(entries, currency);
                printTransactionContent(entries);
            }
        });
    });

    openTransactionWindow.addEventListener('click', () => {
        if (transactionWindow.className.includes('hide')) {
            transactionWindow.classList.remove('hide');
            disableTransactionWindow.classList.remove('hide');
            openTransactionWindow.classList.add('clicked');

            setTimeout(() => {
                transactionWindow.style.opacity = 1;
                transactionWindow.style.transform = 'scale(1)';
            }, 5);

            headline.style.opacity = .2;
            entriesWrapper.style.opacity = .2;

            const selectedEntries = document.getElementsByClassName('selected');
            const selects = document.getElementsByTagName('select');

            if (selectedEntries.length > 0) {
                for (const option of selects[0].children) {
                    if (option.value === selectedEntries[0].data.name) {
                        option.selected = true;
                        document.getElementById('dispatcherBankBalanceBefore').textContent = selectedEntries[0].data.bankBalance;
                    }
                }
            }

            if (selectedEntries.length === 2) {
                for (const option of selects[1].children) {
                    if (option.value === selectedEntries[1].data.name) {
                        option.selected = true;
                        document.getElementById('receiverBankBalanceBefore').textContent = selectedEntries[1].data.bankBalance;
                    }
                }
            }
        } else {
            transactionWindow.style.opacity = 0;
            transactionWindow.style.transform = 'scale(.6)';

            setTimeout(() => {
                transactionWindow.classList.add('hide');
                clearTransactionWindow();
            }, 450);

            disableTransactionWindow.classList.add('hide');
            openTransactionWindow.classList.remove('clicked');
            
            headline.style.opacity = 1;
            entriesWrapper.style.opacity = 1;
        }

        handleInputChangeEvent();
    });

    disableTransactionWindow.addEventListener('click', () => {
        openTransactionWindow.click();
    });

    signOut.addEventListener('click', () => {
        firebase.auth().signOut();
    });
});

function printEntries(entries, currency) {
    const parent = document.getElementById('entriesWrapper');

    while (document.getElementsByClassName('entry').length !== 0) {
        parent.removeChild(document.getElementsByClassName('entry')[0]);
    }
    
    for (const entry of entries) {
        const newEntry = document.createElement('div');
        const name = document.createElement('p');
        const bankBalance = document.createElement('p');
        const groupBox = document.createElement('div');
        const group = document.createElement('div');

        name.textContent = entry.name;
        bankBalance.textContent = `${entry.bankBalance} ${currency}`;

        groupBox.classList.add(`${entry.group}Group`);
        newEntry.classList.add('entry');
        newEntry.setAttribute('id', `entry${entry.key}`);

        newEntry.data = entry;

        newEntry.addEventListener('click', () => {
            const elements = document.getElementsByClassName('selected');
            const params = sessionStorage.getItem('params');

            if (newEntry.className.includes('selected')) {
                newEntry.classList.remove('selected');

                if (params) {
                    let data = JSON.parse(params);
                    data = data.filter(e => e != entry.name);
                    sessionStorage.setItem('params', JSON.stringify(data));
                }
            } else if (elements.length < 2) {
                newEntry.classList.add('selected');

                if (params) {
                    const data = JSON.parse(params);
                    data.push(entry.name);
                    sessionStorage.setItem('params', JSON.stringify(data));
                } else {
                    sessionStorage.setItem('params', JSON.stringify([entry.name]));
                }
            }
        });

        groupBox.appendChild(group);
        newEntry.appendChild(name);
        newEntry.appendChild(bankBalance);
        newEntry.appendChild(groupBox);

        parent.appendChild(newEntry);
    }

    selectUrlEntries();
}

function showFeedbackMessage(success, headline) {
    if (!isCreated) createFeedbackMessage();

    document.getElementById('feedback').style.right = '4vw';
    
    if (success) {
        document.getElementById('crossSvg').classList.add('hide');
        document.getElementById('checkSvg').classList.remove('hide');
    } else {
        document.getElementById('checkSvg').classList.add('hide');
        document.getElementById('crossSvg').classList.remove('hide');
    }
    
    document.getElementById('feedbackText').textContent = headline;

    setTimeout(() => {
        document.getElementById('feedback').style.right = '-100vw';
    }, 3000);
}

function createFeedbackMessage() {
    if (!isCreated) {
        const parent = document.createElement('div');
        const iconWrapper = document.createElement('div');
        const checkIcon = document.createElement('i');
        const crossIcon = document.createElement('i');

        checkIcon.setAttribute('class', 'fas fa-check-circle');
        crossIcon.setAttribute('class', 'fas fa-times-circle');

        checkIcon.setAttribute('id', 'checkSvg');
        crossIcon.setAttribute('id', 'crossSvg');
        
        iconWrapper.appendChild(checkIcon);
        iconWrapper.appendChild(crossIcon);

        const span = document.createElement('span');
        span.setAttribute('id', 'feedbackText');

        parent.setAttribute('id', 'feedback');

        parent.appendChild(iconWrapper);
        parent.appendChild(span);
        document.body.appendChild(parent);

        isCreated = true;
    }
}

function printTransactionContent(entries) {
    const parent = document.getElementById('transactionWindow');

    while (parent.firstChild) parent.removeChild(parent.firstChild);

    const headline = document.createElement('h2');
    headline.textContent = 'Transaktion erstellen';

    const personRow = document.createElement('div');
    const bankBalanceRow = document.createElement('div');

    let dispatcherWrapper = document.createElement('div')
    let receiverWrapper = document.createElement('div');
    let iconWrapper = document.createElement('div');
    let icon = document.createElement('i');
    let dispatcherText = document.createElement('span');
    let receiverText = document.createElement('span');
    const dispatcherSelect = document.createElement('select');
    const receiverSelect = document.createElement('select');

    //#region personRow
    for (let i = 0; i < 2; i++) {
        for (const entry of entries) {
            const option = document.createElement('option');
            option.value = entry.name;
            option.textContent = entry.name;
            option.data = entry;
    
            i === 0 ? dispatcherSelect.appendChild(option) : receiverSelect.appendChild(option);
        }   
    }

    icon.addEventListener('click', () => {
        const dispatcherIndex = dispatcherSelect.selectedIndex;
        dispatcherSelect.children[receiverSelect.selectedIndex].selected = true;
        receiverSelect.children[dispatcherIndex].selected = true;

        let temp = dispatcherBankBalanceAfter.textContent;
        dispatcherBankBalanceAfter.textContent = receiverBankBalanceAfter.textContent;
        receiverBankBalanceAfter.textContent = temp;

        temp = dispatcherBankBalanceBefore.textContent;
        dispatcherBankBalanceBefore.textContent = receiverBankBalanceBefore.textContent;
        receiverBankBalanceBefore.textContent = temp;

        handleInputChangeEvent();
    });

    dispatcherText.textContent = 'Absender';
    receiverText.textContent = 'Empfänger';

    icon.setAttribute('class', 'fas fa-exchange-alt');
    personRow.classList.add('personRow');
    dispatcherWrapper.classList.add('dispatcherWrapper');
    iconWrapper.classList.add('iconWrapper');
    receiverWrapper.classList.add('receiverWrapper');

    dispatcherWrapper.appendChild(dispatcherText);
    iconWrapper.appendChild(icon);
    receiverWrapper.appendChild(receiverText);

    dispatcherWrapper.appendChild(dispatcherSelect);
    receiverWrapper.appendChild(receiverSelect);

    personRow.appendChild(dispatcherWrapper);
    personRow.appendChild(iconWrapper);
    personRow.appendChild(receiverWrapper);

    //#endregion

    //#region bankBalanceRow
    dispatcherWrapper = document.createElement('div');
    receiverWrapper = document.createElement('div');

    const dispatcherBankBalanceBefore = document.createElement('span');
    const dispatcherBankBalanceAfter = document.createElement('span');
    const receiverBankBalanceBefore = document.createElement('span');
    const receiverBankBalanceAfter = document.createElement('span');

    dispatcherBankBalanceBefore.textContent = dispatcherSelect.children[dispatcherSelect.selectedIndex].data.bankBalance;
    receiverBankBalanceBefore.textContent = receiverSelect.children[receiverSelect.selectedIndex].data.bankBalance;
    
    dispatcherSelect.addEventListener('change', () => {
        dispatcherBankBalanceBefore.textContent = dispatcherSelect.children[dispatcherSelect.selectedIndex].data.bankBalance;
        handleInputChangeEvent();
    });

    receiverSelect.addEventListener('change', () => {
        receiverBankBalanceBefore.textContent = receiverSelect.children[receiverSelect.selectedIndex].data.bankBalance;
        handleInputChangeEvent();
    });

    bankBalanceRow.classList.add('bankBalanceRow');
    dispatcherWrapper.classList.add('dispatcherWrapper');
    receiverWrapper.classList.add('receiverWrapper');

    dispatcherBankBalanceBefore.setAttribute('id', 'dispatcherBankBalanceBefore');
    dispatcherBankBalanceAfter.setAttribute('id', 'dispatcherBankBalanceAfter');
    receiverBankBalanceBefore.setAttribute('id', 'receiverBankBalanceBefore');
    receiverBankBalanceAfter.setAttribute('id', 'receiverBankBalanceAfter');

    dispatcherWrapper.appendChild(dispatcherBankBalanceBefore);
    dispatcherWrapper.appendChild(dispatcherBankBalanceAfter);

    receiverWrapper.appendChild(receiverBankBalanceBefore);
    receiverWrapper.appendChild(receiverBankBalanceAfter);

    bankBalanceRow.appendChild(dispatcherWrapper);
    bankBalanceRow.appendChild(receiverWrapper);
    //#endregion

    //#region inputRow
    const inputRow = document.createElement('div');
    const input = document.createElement('input');

    input.type = 'number';
    input.placeholder = 'Betrag';

    input.addEventListener('change', () => {
        handleInputChangeEvent();
    });

    input.setAttribute('id', 'input');
    inputRow.classList.add('inputRow');

    inputRow.appendChild(input);
    //#endregion

    //#region buttonRow
    const buttonRow = document.createElement('div');
    const button = document.createElement('div');
    const text = document.createElement('span');

    text.textContent = 'Senden';

    button.addEventListener('click', () => {
        if (input.value.trim() !== '' && parseInt(input.value) > 0) {
            if (!dispatcherBankBalanceAfter.className.includes('negativeBB')) {
                const dispatcher = entries.filter(e => e.name === dispatcherSelect.selectedOptions[0].value)[0];
                const receiver = entries.filter(e => e.name === receiverSelect.selectedOptions[0].value)[0];

                if (dispatcher.name !== receiver.name) {
                    firebase.database().ref(`entries/${dispatcher.key}/bankBalance`).set(
                        dispatcher.bankBalance - parseInt(input.value)
                    ).then(() => {
                        firebase.database().ref(`entries/${receiver.key}/bankBalance`).set(
                            receiver.bankBalance + parseInt(input.value)
                        ).then(() => {
                            showFeedbackMessage(true, 'Transaktion abgeschlossen');
                            document.getElementById('openTransactionWindow').click();

                            let key = Date.now();

                            firebase.database().ref(`entries/${dispatcher.key}/history/${key}`).set({
                                amount: -parseInt(input.value),
                                executer: firebase.auth().currentUser.uid,
                                key
                            }).then(() => {
                                key = Date.now();

                                firebase.database().ref(`entries/${receiver.key}/history/${key}`).set({
                                    amount: parseInt(input.value),
                                    executer: firebase.auth().currentUser.uid,
                                    key
                                });
                            });
                        });
                    });
                } else {
                    showFeedbackMessage(false, 'Absender und Empfänger gleich');
                }
            } else {
                showFeedbackMessage(false, 'Zu wenig Geld am Konto');
            }
        } else {
            showFeedbackMessage(false, 'Ungültige Eingabe');
        }
    });

    buttonRow.classList.add('buttonRow');
    button.classList.add('button');

    button.appendChild(text);
    buttonRow.appendChild(button);

    parent.appendChild(headline);
    parent.appendChild(personRow);
    parent.appendChild(bankBalanceRow);
    parent.appendChild(inputRow);
    parent.appendChild(buttonRow);
    //#endregion

    handleInputChangeEvent();
}

function clearTransactionWindow() {
    document.getElementsByTagName('input')[0].value = '';
    document.getElementsByTagName('select')[0].children[0].selected = true;
    document.getElementsByTagName('select')[1].children[0].selected = true;
}

function handleInputChangeEvent() {
    const input = document.getElementById('input');
    const dispatcherBankBalanceAfter = document.getElementById('dispatcherBankBalanceAfter');
    const dispatcherBankBalanceBefore = document.getElementById('dispatcherBankBalanceBefore');
    const receiverBankBalanceAfter = document.getElementById('receiverBankBalanceAfter');
    const receiverBankBalanceBefore = document.getElementById('receiverBankBalanceBefore');

    dispatcherBankBalanceAfter.textContent = parseInt(dispatcherBankBalanceBefore.textContent) - parseInt(input.value);
    receiverBankBalanceAfter.textContent = parseInt(receiverBankBalanceBefore.textContent) + parseInt(input.value);

    if (isNaN(parseInt(dispatcherBankBalanceAfter.textContent))) {
        dispatcherBankBalanceAfter.textContent = dispatcherBankBalanceBefore.textContent;
    }

    if (isNaN(parseInt(receiverBankBalanceAfter.textContent))) {
        receiverBankBalanceAfter.textContent = receiverBankBalanceBefore.textContent;
    }
    
    if (parseInt(dispatcherBankBalanceAfter.textContent) >= 0) {
        dispatcherBankBalanceAfter.className = 'positiveBB';
    } else {
        dispatcherBankBalanceAfter.className = 'negativeBB';
    }
    
    if (parseInt(receiverBankBalanceAfter.textContent) >= 0) {
        receiverBankBalanceAfter.className = 'positiveBB';
    } else {
        receiverBankBalanceAfter.className = 'negativeBB';
    }
}

function selectUrlEntries() {
    let params = getUrlParams(window.location.href);
    let storageParams;
    const entries = document.getElementsByClassName('entry');
    const expressions = [
        {search: '+', replace: ' '},
        {search: '%20', replace: ' '},
        {search: 'ue', replace: 'ü'},
        {search: 'oe', replace: 'ö'},
        {search: 'ae', replace: 'ä'},
    ];

    if (params['name'] === undefined && params['name2'] === undefined) {
        if (sessionStorage.getItem('params')) {
            params = JSON.parse(sessionStorage.getItem('params'));
            storageParams = [];
            
            if (params[0] !== undefined) {
                storageParams['name'] = params[0];
                
                if (params[1] !== undefined) {
                    storageParams['name2'] = params[1];
                }
            } else {
                storageParams = [];
            }
        }
    }

    let urlParams = [];

    if (storageParams === undefined) {
        urlParams = params;
    } else {
        urlParams = storageParams;
    }

    for (const expression of expressions) {
        if (urlParams['name'] !== undefined) {
            while (urlParams['name'].includes(expression.search)) {
                urlParams['name'] = urlParams['name'].replace(expression.search, expression.replace);
            }
        }
    
        if (urlParams['name2'] !== undefined) {
            while (urlParams['name2'].includes(expression.search)) {
                urlParams['name2'] = urlParams['name2'].replace(expression.search, expression.replace);
            }
        }
    }

    sessionStorage.setItem('params', JSON.stringify([]));

    for (const entry of entries) {
        if (urlParams['name'] === entry.children[0].textContent || urlParams['name2'] === entry.children[0].textContent) {
            entry.children[0].click();
        }
    }
}