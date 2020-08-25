window.addEventListener('load', () => {
    const startScreen = document.getElementById('startScreen');
    const emailWrapper = document.getElementById('emailWrapper');
    const goToSignIn = document.getElementById('goToSignIn');
    const goToSignUp = document.getElementById('goToSignUp');
    const continueWithSignIn = document.getElementById('continueWithSignIn');
    const continueWithSignUp = document.getElementById('continueWithSignUp');
    const signInWrapper = document.getElementById('signInWrapper');
    const signInButton = document.getElementById('signInBtn');
    const signUpButton = document.getElementById('signUpBtn');
    const backButton = document.getElementById('backButton');

    initEyes();

    continueWithSignIn.addEventListener('click', () => {
        emailWrapper.style.left = 0;
        startScreen.classList.add('hide');
        emailWrapper.classList.remove('hide');
    });

    continueWithSignUp.addEventListener('click', () => {
        emailWrapper.style.left = '-100vw';
        startScreen.classList.add('hide');
        emailWrapper.classList.remove('hide');
    });

    backButton.addEventListener('click', () => {
        emailWrapper.style.left = 0;
        emailWrapper.classList.add('hide');
        startScreen.classList.remove('hide');
        clearInputs();
    });

    goToSignUp.addEventListener('click', () => {
        emailWrapper.style.left = '-100vw';
        setTimeout(() => {
            clearInputs();
        }, 200);
    });

    goToSignIn.addEventListener('click', () => {
        emailWrapper.style.left = 0;
        setTimeout(() => {
            clearInputs();
        }, 200);
    });

    signInButton.addEventListener('click', () => {
        const username = document.getElementById('usernameIn');
        const password = document.getElementById('passwordIn');
        const usInFeedback = document.getElementById('usInFeedback');
        const pwInFeedback = document.getElementById('pwInFeedback');
        let isValid = true;

        activateLoading(.3);

        // username validation
        if (username.value.trim() === '') {
            // username value is empty
            usInFeedback.textContent = 'Bitte geben Sie einen Benutzernamen ein.';
            isValid = false;
            username.classList.add('errorInput');
        } else if (validateUsername(username.value)) {
            // username is valid
            usInFeedback.textContent = '';
            username.classList.remove('errorInput');
        } else {
            // username is invalid
            usInFeedback.textContent = 'Ungültiger Benutzername.';
            username.classList.add('errorInput');
            isValid = false;
        }

        if (password.value.trim() === '') {
            // password value is empty
            pwInFeedback.textContent = 'Bitte geben Sie ein Passwort ein.';
            isValid = false;
            password.classList.add('errorInput');
        } else if (validatePassword(password.value)) {
            // password is valid
            pwInFeedback.textContent = '';
            password.classList.remove('errorInput');
        } else {
            // password is invalid ()
            pwInFeedback.textContent = 'Ungültiges Passwort.';
            isValid = false;
            password.classList.add('errorInput');
        }

        
        if (isValid) {
            let email = `${username.value.trim().toLowerCase()}@mail.com`;

            while (email.includes(' ')) {
                email = email.replace(' ', '');
            }

            const promise = firebase.auth().signInWithEmailAndPassword(email, password.value);

            promise.catch((error) => {
                const errorMsg = error.message;
                const messages = [
                    {message: 'The password is invalid or the user does not have a password.', feedback: 'Das eingegebene Passwort ist ungültig.', affected: 'pw'},
                    {message: 'Too many unsuccessful login attempts.  Please include reCaptcha verification or try again later', feedback: 'Der Anmelde Vorgang ist zu oft fehlgeschlagen, versuchen Sie es später erneut.', affected: ''},
                    {message: 'There is no user record corresponding to this identifier. The user may have been deleted.', feedback: 'Es wurde kein Account mit dem eingegebenen Benutzernamen gefunden.', affected: 'em'},
                    {message: 'A network error (such as timeout, interrupted connection or unreachable host) has occurred.', feedback: 'Zeitüberschreitung beim Anmelden. Versuche Sie es später erneut.', affected: ''},
                    {message: 'The email address is already in use by another account.', feedback: 'Der angebene Benutzername wird bereits verwendet.', affected: 'em'},
                ];

                for (const msg of messages) {
                    if (msg.message === errorMsg) {
                        if (msg.affected === 'em') {
                            usInFeedback.textContent = msg.feedback;
                            username.classList.add('errorInput');
                        } else if (msg.affected === 'pw') {
                            pwInFeedback.textContent = msg.feedback;
                            password.classList.add('errorInput');
                        }
                    }
                }

                deactiveLoading();
            });

            promise.then(() => {
                deactiveLoading();
            });
        } else {
            deactiveLoading();
        }
    });

    signUpButton.addEventListener('click', () => {
        const username = document.getElementById('usernameUp');
        const password = document.getElementById('passwordUp');
        const emUpFeedback = document.getElementById('emUpFeedback');
        const unUpFeedback = document.getElementById('unUpFeedback');
        const pwUpFeedback = document.getElementById('pwUpFeedback');
        let isValid = true;

        activateLoading(.3);

        // username validation
        if (username.value.trim() === '') {
            // username value is empty
            unUpFeedback.textContent = 'Bitte geben Sie einen Benutzernamen ein.';
            isValid = false;
            username.classList.add('errorInput');
        } else if (validateUsername(username.value)) {
            // username is valid
            unUpFeedback.textContent = '';
            username.classList.remove('errorInput');
        } else {
            // username is invalid
            unUpFeedback.textContent = 'Ungültiger Benutzername.';
            username.classList.add('errorInput');
            isValid = false;
        }

        if (password.value === '') {
            // password value is empty
            pwUpFeedback.textContent = 'Bitte geben Sie ein Passwort ein.';
            isValid = false;
            password.classList.add('errorInput');
        } else if (validatePassword(password.value)) {
            // password is valid
            pwUpFeedback.textContent = '';
            password.classList.remove('errorInput');
        } else {
            if (!/[a-z]/.test(password.value)) {
                // no lower case letters
                pwUpFeedback.textContent = 'Bitte geben Sie auch Kleinbuchstaben ein.';
            } else if (!/[A-Z]/.test(password.value)) {
                // no higer case letters 
                pwUpFeedback.textContent = 'Bitte geben Sie auch Großbuchstaben ein.';
            } else if (!/[0-9]/.test(password.value)) {
                // no numbers
                pwUpFeedback.textContent = 'Bitte geben Sie auch Ziffern ein.';
            } else if (password.value.length < 5) {
                // to short
                pwUpFeedback.textContent = 'Das Passwort ist zu kurz.';
            } else {
                // unknown error
                pwUpFeedback.textContent = 'Es ist ein unbekannter Fehler aufgetreten, bitte versuchen Sie es später erneut.';
            }

            password.classList.add('errorInput');
            isValid = false;
        }

        if (isValid) {
            let email = `${username.value.trim().toLowerCase()}@mail.com`;

            while (email.includes(' ')) {
                email = email.replace(' ', '');
            }

            const promise = firebase.auth().createUserWithEmailAndPassword(email, password.value);

            promise.catch((error) => {
                const errorMsg = error.message;
                const messages = [
                    {message: 'The password is invalid or the user does not have a password.', feedback: 'Das eingegebene Passwort ist ungültig.', affected: 'pw'},
                    {message: 'Too many unsuccessful login attempts.  Please include reCaptcha verification or try again later', feedback: 'Der Anmelde Vorgang ist zu oft fehlgeschlagen, versuchen Sie es später erneut.', affected: ''},
                    {message: 'There is no user record corresponding to this identifier. The user may have been deleted.', feedback: 'Es wurde kein Account mit dem eingegebenen Benutzernamen gefunden.', affected: 'em'},
                    {message: 'A network error (such as timeout, interrupted connection or unreachable host) has occurred.', feedback: 'Zeitüberschreitung beim Anmelden. Versuche Sie es später erneut.', affected: ''},
                    {message: 'The email address is already in use by another account.', feedback: 'Der angebene Benutzername wird bereits verwendet.', affected: 'em'},
                ];

                for (const msg of messages) {
                    if (msg.message === errorMsg) {
                        if (msg.affected === 'em') {
                            emUpFeedback.textContent = msg.feedback;
                            email.classList.add('errorInput');
                        } else if (msg.affected === 'pw') {
                            pwUpFeedback.textContent = msg.feedback;
                            password.classList.add('errorInput');
                        }
                    }
                }

                deactiveLoading();
            });

            promise.then(() => {
                deactiveLoading();
            });
        } else {            
            deactiveLoading();
        }
    });

    function initEyes() {
        const pwWrapper = document.getElementsByClassName('pwWrapper');

        for (let i = 0; i < pwWrapper.length; i++) {
            for (let j = 1; j < pwWrapper[i].children.length; j++) {        
                const icon = pwWrapper[i].children[j];
                const input = pwWrapper[i].children[j-1];
                
                icon.addEventListener('click', () => {
                    if (icon.className.includes('-slash')) {
                        icon.className = icon.className.replace('-slash', '');
                        input.type = 'password';
                    } else {
                        icon.className += '-slash';
                        input.type = 'text';
                    }
                });
            }
        }
    }
});

// @param string
function validatePassword(password) {
    return /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && password.length > 5;
}

// @param string
function validateUsername(username) {
    return /^[a-z]+$/i.test(username);
}

function clearInputs() {
    const inputs = [
        document.getElementById('usernameIn'),
        document.getElementById('passwordIn'),
        document.getElementById('usInFeedback'),
        document.getElementById('pwInFeedback'),
        document.getElementById('usernameUp'),
        document.getElementById('passwordUp'),
        document.getElementById('unUpFeedback'),
        document.getElementById('pwUpFeedback')
    ];

    for (const input of inputs) {
        input.value = '';
        input.textContent = '';
        input.classList.remove('errorInput');
    }
}