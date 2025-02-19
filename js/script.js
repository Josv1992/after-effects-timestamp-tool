let FPS = 30;
let customFPS = false;

document.addEventListener("DOMContentLoaded", () => {
    const outputDiv = document.getElementById('outputDiv');

    const inputTextArea = document.getElementById('inputTextArea');
    const processButton = document.getElementById('processButton');

    processButton.addEventListener('click', () => {
        if (!verifyInput(inputTextArea.value)) {
            return;
        }

        const output = processTracklist(inputTextArea.value);
        const outputDivContainer = document.getElementById('outputDivContainer');

        outputDivContainer.style.display = 'block';
        outputDiv.innerHTML = escapeHtml(output);
        hljs.highlightElement(outputDiv);
    });

    const fpsButtons = document.querySelectorAll(".fps-btn");
    const customInput = document.getElementById("customFPS");
    const hiddenInput = document.getElementById("inputFPS");

    fpsButtons.forEach(button => {
        button.addEventListener("click", () => {
            fpsButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const value = button.getAttribute("data-value");
            if (value === "custom") {
                customInput.classList.remove("hidden");
                customInput.focus();
                hiddenInput.value = "";
                customFPS = true;
            } else {
                customInput.classList.add("hidden");
                hiddenInput.value = value;
                customFPS = false;
            }
        });
    });

    customInput.addEventListener("input", () => {
        hiddenInput.value = customInput.value;
    });
});


const processTracklist = (input) => {
    if (customFPS) {
        FPS = document.getElementById('customFPS').value;
    } else {
        FPS = document.getElementById('inputFPS').value;
    }
    let outputString = '';
    outputString += 't = timeToFrames(); \n \n';

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
    
    input = input.trimEnd();

    if (input === '') {
        showNotification('Input is empty', 'error');
        return false;
    }

    const timestampRegex = /^\d{1,2}:\d{2}(?::\d{2})?\s+.+/;
    const lines = input.split('\n');

    let prevTimestamp = 0;

    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes(':')) {
            showNotification(`semicolon (:) missing on line ${i + 1} (${lines[i]}).`, 'error');
            return false;
        }

        if (!timestampRegex.test(lines[i])) {
            showNotification(`Invalid format on line ${i + 1} (${lines[i]}). Missing tracktitle and/or artist name.`, 'error');
            return false;
        }

        const timestamp = convertTimeToFrames(lines[i].split(' ')[0]);

        if (timestamp < prevTimestamp) {
            showNotification(`The time at line ${i + 1} (${lines[i]}) comes before the time at the next line.`, 'error');
            return false;
        }

        prevTimestamp = timestamp;
    }   

    return true;
}

const convertTimeToFrames = (time) => {
    let semiColons = time.split(':').length - 1;
    if (semiColons === 1) {
        let [minutes, seconds] = time.split(':');
        return Math.round(parseInt(minutes) * 60 * FPS + parseInt(seconds) * FPS);
    } else if (semiColons === 2) {
        let [hours, minutes, seconds] = time.split(':');
        return Math.round((parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)) * FPS);
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
        }, 1000);
    }, 5000);
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
        }, 1000);
    }, 2500);
}

const escapeHtml = (input) => {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}