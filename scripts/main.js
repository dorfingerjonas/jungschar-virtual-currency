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
        } else {
            if (!window.location.href.includes('/join')) {
                window.location.href = './join';
            }
        }
    });
});