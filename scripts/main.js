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

    activateLoading();

    firebase.auth().onAuthStateChanged(user => {
        deactiveLoading();

        if (user) {
            if (window.location.href.includes('/join')) {
                window.location.href = '../';
            }

            firebase.database().ref(`users/${firebase.auth().currentUser.uid}`).once('value').then(snapshot => {
                if (snapshot.val() === null) {
                    firebase.database().ref(`users/${firebase.auth().currentUser.uid}`).set({
                        username: getUsernameFromMail(user.email).trim().toLowerCase()
                    });
                }
            });
        } else {
            const params = getUrlParams(window.location.href);

            if (params['name'] !== undefined) {
                if (params['name2'] !== undefined) {
                    sessionStorage.setItem('params', JSON.stringify([params['name'], params['name2']]));
                } else {
                    sessionStorage.setItem('params', JSON.stringify([params['name']]));
                }
            }

            if (!window.location.href.includes('/join')) {
                window.location.href = './join';
            }
        }
    });
});

function getUsernameFromMail(email) {
    return email.replace('@mail.com', '');
}

function getUrlParams(url) {
    if (url !== undefined && url !== null && url.trim() !== '') {
        const params = [];
        const parts = url.split('?');

        for (let i = 1; i < parts.length; i++) {
            if (parts[i].includes('&')) {
                const subPart = parts[i].split('&');

                for (const part of subPart) {
                    const splitted = part.split('=');
                    params[`${splitted[0]}`] = splitted[1];
                }
            } else {
                const subPart = parts[i].split('=');
                params[`${subPart[0]}`] = subPart[1];
            }
        }

        return params;
    }
}