// timer-worker.js

let timer;
let totalSeconds;
let isRunning = false;
let isStudySession = true;
let studyTime;
let breakTime;

function startTimer() {
    if (isRunning) return; // Prevent multiple intervals
    isRunning = true;

    if (totalSeconds === undefined) {
        totalSeconds = isStudySession ? studyTime * 60 : breakTime * 60;
    }

    // Immediately post an update for the UI mode (study/break)
    self.postMessage({ type: 'modeUpdate', isStudySession: isStudySession });

    timer = setInterval(() => {
        if (totalSeconds <= 0) {
            // Post message that the session has ended
            self.postMessage({ type: 'sessionEnd', isStudySession: isStudySession });
            
            // Switch session type and reset for the next one
            isStudySession = !isStudySession;
            totalSeconds = isStudySession ? studyTime * 60 : breakTime * 60;
            
            // Post an update for the new mode
            self.postMessage({ type: 'modeUpdate', isStudySession: isStudySession });
        } else {
            totalSeconds--;
        }
        
        // Post a 'tick' message with the current time every second
        self.postMessage({ type: 'tick', totalSeconds: totalSeconds });
        
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer(newStudyTime) {
    pauseTimer();
    isStudySession = true;
    totalSeconds = newStudyTime * 60;
    
    // Post updates to reset the UI
    self.postMessage({ type: 'modeUpdate', isStudySession: true });
    self.postMessage({ type: 'tick', totalSeconds: totalSeconds });
}


// Listen for messages from the main script
self.onmessage = (e) => {
    const { command, studyTime: st, breakTime: bt } = e.data;
    
    // Update settings if provided
    if (st) studyTime = st;
    if (bt) breakTime = bt;

    switch (command) {
        case 'start':
            startTimer();
            break;
        case 'pause':
            pauseTimer();
            break;
        case 'reset':
            resetTimer(st); // Use the new study time for reset
            break;
    }
};
