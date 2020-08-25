window.addEventListener('load', () => {
    const firebaseConfig = {
        apiKey: 'AIzaSyBqW53U5gv-qnV_HojZnfhM5dH_aW-8Neg',
        authDomain: 'jungschar-virtual-currency.firebaseapp.com',
        databaseURL: 'https://jungschar-virtual-currency.firebaseio.com',
        projectId: 'jungschar-virtual-currency',
        storageBucket: 'jungschar-virtual-currency.appspot.com',
        messagingSenderId: '781734639374',
        appId: '1:781734639374:web:bb2d4cb57d58aff340895f'
    };
    
    firebase.initializeApp(firebaseConfig);
    
    const name = document.getElementById('name');
    const bankBalance = document.getElementById('bankBalance');
    const group = document.getElementById('group');
    const addBtn = document.getElementById('addBtn');
    const disableHistory = document.getElementById('disableHistory');
    let users = [];
    
    if (addBtn !== null) {
        addBtn.addEventListener('click', () => {
            if (name.value.trim() !== '') {
                const key = Date.now();
        
                firebase.database().ref(`entries/${key}`).set({
                    name: name.value,
                    bankBalance: parseInt(bankBalance.value),
                    group: group.selectedOptions[0].value,
                    key
                }).then(() => {
                    const key2 = Date.now();
                    firebase.database().ref(`entries/${key}/history/${key2}`).set({
                        amount: 'Konto erstellt',
                        executer: firebase.auth().currentUser.uid,
                        key
                    });
                });
            }
        });
    }

    firebase.database().ref('users').on('value', userList => {
        for (const key in userList.val()) {
            users[key] = userList.val()[key];
        }
    });
    
    firebase.database().ref('currency').on('value', currency => {
        const parent = document.getElementById('currencyWrapper');
        const saveButton = document.createElement('div');
        const span = document.createElement('span');
        const input = document.createElement('input');

        while (parent.firstChild) parent.removeChild(parent.firstChild);

        input.value = currency.val();
        input.placeholder = 'Währung';

        saveButton.addEventListener('click', () => {
            if (input.value.trim() !== '') {
                firebase.database().ref('currency').set(input.value);
            }
        });

        span.textContent = 'Speichern';

        parent.classList.add('currencyWrapper');
        saveButton.classList.add('button');

        saveButton.appendChild(span);
        parent.appendChild(input);
        parent.appendChild(saveButton);
    });

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
            printEntries(entries);
        }
    });

    function printEntries(entries) {
        const parent = document.getElementById('entriesWrapper');

        while (parent.firstChild) parent.removeChild(parent.firstChild);

        for (const entry of entries) {
            const newEntry = document.createElement('div');
            const inputWrapper = document.createElement('div');
            const buttonWrapper = document.createElement('div');
            const historyButton = document.createElement('div');
            const historySpan = document.createElement('span');
            const saveButton = document.createElement('div');
            const saveSpan = document.createElement('span');
            const deleteButton = document.createElement('div');
            const deleteSpan = document.createElement('span');

            const name = document.createElement('input');
            const bankBalance = document.createElement('input');
            const group = document.createElement('select');

            const options = [
                {value: 'red', text: 'Rot'},
                {value: 'blue', text: 'Blau'},
                {value: 'company', text: 'Firma'}
            ];

            bankBalance.type = 'number';

            name.value = entry.name;
            bankBalance.value = entry.bankBalance;

            for (const optionContent of options) {
                const option = document.createElement('option');
                option.value = optionContent.value;
                option.textContent = optionContent.text;

                entry.group === optionContent.value ? option.selected = true : option.selected = false;
                group.appendChild(option);
            }

            historyButton.addEventListener('click', () => {
                showHistory(entry);
            });

            saveButton.addEventListener('click', () => {
                if (name.value.trim() !== '' && bankBalance.value.trim() !== '') {
                    firebase.database().ref(`entries/${entry.key}`).update({
                        name: name.value,
                        bankBalance: parseInt(bankBalance.value) || 0,
                        group: group.selectedOptions[0].value,
                    }).then(() => {
                        const key = Date.now();

                        if (parseInt(bankBalance.value) - entry.bankBalance !== 0) {
                            firebase.database().ref(`entries/${entry.key}/history/${key}`).set({
                                amount: parseInt(bankBalance.value) - entry.bankBalance,
                                executer: firebase.auth().currentUser.uid,
                                key
                            });
                        }
                    });
                }
            });

            deleteButton.addEventListener('dblclick', () => {
                parent.removeChild(newEntry);

                firebase.database().ref(`entries/${entry.key}`).remove();
            });

            historySpan.textContent = 'Kontoauszug';
            saveSpan.textContent = 'Speichern';
            deleteSpan.textContent = 'Löschen (dblclick)';

            historyButton.classList.add('button');
            saveButton.classList.add('button');
            deleteButton.classList.add('button');
            newEntry.classList.add('entry');

            inputWrapper.appendChild(name);
            inputWrapper.appendChild(bankBalance);
            inputWrapper.appendChild(group);
            historyButton.appendChild(historySpan);
            buttonWrapper.appendChild(historyButton);
            saveButton.appendChild(saveSpan);
            buttonWrapper.appendChild(saveButton);
            deleteButton.appendChild(deleteSpan);
            buttonWrapper.appendChild(deleteButton);
            newEntry.appendChild(inputWrapper);
            newEntry.appendChild(buttonWrapper);
            parent.appendChild(newEntry);
        }
    }

    function showHistory(entry) {
        const parent = document.getElementById('historyWrapper');
        const historyEntries = [];

        while (parent.firstChild) parent.removeChild(parent.firstChild);

        for (const key in entry.history) {
            historyEntries.push(entry.history[key]);
        }

        for (const entry of historyEntries) {
            const newEntry = document.createElement('div');
            const amount = document.createElement('span');
            const executer = document.createElement('span');

            let date = new Date(entry.key);
            date = `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}, ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
            
            executer.textContent = `${users[entry.executer].username}, ${date}`;
            amount.textContent = entry.amount;

            if (entry.amount < 0) {
                amount.classList.add('negativeBB');
            } else {
                amount.classList.add('positiveBB');

                if (entry.amount < 0 || entry.amount >= 0) {
                    amount.textContent = `+${amount.textContent}`;
                }
            }

            newEntry.classList.add('historyEntry');

            newEntry.appendChild(amount);
            newEntry.appendChild(executer);
            parent.appendChild(newEntry);
        }
        
        parent.classList.remove('hide');
        disableHistory.classList.remove('hide');
        document.body.setAttribute('style', 'overflow-y: hidden !important');

        const wrapper = [
            document.getElementById('headline'),
            document.getElementById('currencyWrapper'),
            document.getElementById('addEntry'),
            document.getElementById('entriesWrapper')
        ];

        for (const box of wrapper) {
            box.style.opacity = .2;
        }

        setTimeout(() => {
            parent.style.opacity = 1;
            parent.style.transform = 'scale(1)';
        }, 5);
    }

    disableHistory.addEventListener('click', () => {
        const historyWrapper = document.getElementById('historyWrapper');
        historyWrapper.style.opacity = 0;
        historyWrapper.style.transform = 'scale(.6)';
        document.body.setAttribute('style', 'overflow-y: scroll !important');

        const wrapper = [
            document.getElementById('headline'),
            document.getElementById('currencyWrapper'),
            document.getElementById('addEntry'),
            document.getElementById('entriesWrapper') 
        ];

        for (const box of wrapper) {
            box.style.opacity = 1;
        }

        setTimeout(() => {
            historyWrapper.classList.add('hide');
            disableHistory.classList.add('hide');
        }, 310);
    });
});