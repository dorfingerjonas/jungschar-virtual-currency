function activateLoading(opacity) {
    const loader = document.getElementById('loader');
    const wrappers = [
        document.getElementById('mainScreen'),
        document.getElementById('logInScreen')
    ];

    for (const wrapper of wrappers) {
        if (wrapper !== null)
        wrapper.style.opacity = opacity;
    }

    loader.classList.remove('hide');
}

function deactiveLoading() {
    const loader = document.getElementById('loader');
    const wrappers = [
        document.getElementById('mainScreen'),
        document.getElementById('logInScreen')
    ];
    
    for (const wrapper of wrappers) {
        if (wrapper !== null)
        wrapper.style.opacity = 1;
    }
    
    loader.classList.add('hide');
}