let FPS = 30;

document.addEventListener("DOMContentLoaded", () => {
    const outputDiv = document.getElementById('outputDiv');

    const inputTextArea = document.getElementById('inputTextArea');
    const processButton = document.getElementById('processButton');

    processButton.addEventListener('click', () => {
        const output = processTracklist(inputTextArea.value);
        const outputDivContainer = document.getElementById('outputDivContainer');
        verifyInput(inputTextArea.value);

        outputDivContainer.style.display = 'block';
        outputDiv.innerHTML = escapeHtml(output);
        hljs.highlightElement(outputDiv);
    });
});

const processTracklist = (input) => {
    FPS = document.getElementById('inputFPS').value;
    let outputString = '';

    input = input.trim();

    const lines = input.split('\n');

    const lastLine = lines[lines.length - 1].split(' ').slice(1).join(' ').trimStart();

    for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        const firstSpaceIndex = line.indexOf(' ');

        const timestamp = convertTimeToFrames(lines[i + 1].split(' ')[0]);
        const trackName = line.slice(firstSpaceIndex + 1).trim();

        outputString += `if (t < ${timestamp}) {\n    "${trackName}"\n} else `;
    }

    outputString += `{\n    "${lastLine}"\n}`;
    return outputString;
}

const verifyInput = (input) => {
    const lines = input.split('\n');
    const errors = [];

    lines.forEach((line, index) => {
        if (!line.includes(':')) {
            errors.push(`semicolon missing on line ${index+1}`)
            showNotification(`semicolon missing on line ${index+1}`, 'error')
        }        
    });

    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }

}

const convertTimeToFrames = (time) => {
    let semiColons = time.split(':').length - 1;
    if (semiColons === 1) {
        let [minutes, seconds] = time.split(':');
        return parseInt(minutes) * 60 * FPS + parseInt(seconds) * FPS;
    } else if (semiColons === 2) {
        let [hours, minutes, seconds] = time.split(':');
        return (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)) * FPS;
    }
}

const copyToClipboard = () => {
    const outputDiv = document.getElementById('outputDiv');
    const textToCopy = outputDiv.innerText;

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            showNotification('Result copied to clipboard!', 'success');
            showCopiedMessage('Copied!');
        })
        .catch(err => {
            showNotification(err, 'error');
        });
}

const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;

    if (type === 'success') {
        notification.style.backgroundColor = '#8dd088';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#a25656';
    }
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 1000);
}

const showCopiedMessage = (message) => {
    const copyButtonTextContainer = document.getElementById('copyButtonText');
    const copyIcon = document.getElementById('copyIcon');
    const checkmarkIcon = document.getElementById('checkmarkIcon');

    const originalText = copyButtonTextContainer.innerText;
    copyIcon.style.display = 'none';
    checkmarkIcon.style.display = 'block';
    copyButtonTextContainer.innerText = message;

    setTimeout(() => {
        setTimeout(() => {
            copyButtonTextContainer.innerText = originalText;
            copyIcon.style.display = 'block';
            checkmarkIcon.style.display = 'none';
        }, 300);
    }, 1000);
}

const escapeHtml = (input) => {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}