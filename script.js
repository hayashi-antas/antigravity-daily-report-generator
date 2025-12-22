/**
 * Daily Report Generator Logic
 * 
 * 仕様書に基づく決定事項:
 * - 外部APIなし、ルールベースで生成。
 * - 入力内容はLocalStorageに保存。
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputTasks = document.getElementById('input-tasks');
    const inputLearnings = document.getElementById('input-learnings');
    const inputSchedule = document.getElementById('input-schedule');
    const btnGenerate = document.getElementById('btn-generate');
    const outputReport = document.getElementById('output-report');
    const charCount = document.getElementById('char-count');
    const btnCopy = document.getElementById('btn-copy');
    const toast = document.getElementById('toast');

    // Constants for sentence endings
    const SENTENCE_ENDINGS = [
        'しました。',
        'を実施しました。',
        'を行いました。',
        'に取り組みました。',
        'を完了しました。'
    ];

    // --- Persistence (LocalStorage) ---

    // Load data
    const loadFromStorage = () => {
        if (localStorage.getItem('drg_tasks')) inputTasks.value = localStorage.getItem('drg_tasks');
        if (localStorage.getItem('drg_learnings')) inputLearnings.value = localStorage.getItem('drg_learnings');
        if (localStorage.getItem('drg_schedule')) inputSchedule.value = localStorage.getItem('drg_schedule');
    };

    // Save data
    const saveToStorage = () => {
        localStorage.setItem('drg_tasks', inputTasks.value);
        localStorage.setItem('drg_learnings', inputLearnings.value);
        localStorage.setItem('drg_schedule', inputSchedule.value);
    };

    // Event listeners for saving
    [inputTasks, inputLearnings, inputSchedule].forEach(el => {
        el.addEventListener('input', saveToStorage);
    });

    loadFromStorage();

    // --- Generation Logic ---

    // Helper: Remove bullet points and whitespace
    const cleanLine = (line) => {
        // Remove standard bullet points and whitespace
        return line.replace(/^[\s\t]*[・\-\*]\s*/, '').trim();
    };

    // Helper: Determine if a line needs a generated ending
    const needsEnding = (line) => {
        // If empty or ends with punctuations that suggest a sentence end
        if (!line) return false;
        const endings = ['。', '！', '!', '？', '?'];
        return !endings.some(e => line.endsWith(e));
    };

    // Helper: Get a random ending
    const getRandomEnding = () => {
        return SENTENCE_ENDINGS[Math.floor(Math.random() * SENTENCE_ENDINGS.length)];
    };

    // Main generate function
    const generateReport = () => {
        const tasksVal = inputTasks.value.trim();
        
        if (!tasksVal) {
            alert('業務内容（今日やったこと）を入力してください。');
            return;
        }

        const learningsVal = inputLearnings.value.trim();
        const scheduleVal = inputSchedule.value.trim();

        let report = '';

        // 1. Greeting
        report += 'お疲れ様です。本日の業務日報を報告いたします。\n\n';

        // 2. Tasks
        report += '【業務内容】\n';
        const taskLines = tasksVal.split(/\r\n|\n|\r/);
        
        taskLines.forEach(line => {
            let processedLine = cleanLine(line);
            if (!processedLine) return; // Skip empty lines

            if (needsEnding(processedLine)) {
                processedLine += getRandomEnding();
            }
            report += processedLine + '\n';
        });
        
        report += '\n';

        // 3. Learnings
        if (learningsVal) {
            report += '【学び・気づき】\n';
            report += learningsVal + '\n\n'; // Keep user's formatting for better control, or we could process similarly
        }

        // 4. Schedule
        if (scheduleVal) {
            report += '【明日の予定】\n';
            report += scheduleVal + '\n\n';
        }

        // 5. Closing
        report += 'よろしくお願いいたします。';

        // Set output
        outputReport.value = report;
        
        // Auto-resize output textarea logic could be added here if needed, but manual scroll is fine.
        updateCharCount();
        
        // Scroll to output
        outputReport.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // --- UI Logic ---

    const updateCharCount = () => {
        const count = outputReport.value.length;
        charCount.textContent = `現在：約${count}文字`;
    };

    const showToast = () => {
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 2000);
    };

    const copyToClipboard = async () => {
        const text = outputReport.value;
        if (!text) return;

        try {
            // Try modern API
            await navigator.clipboard.writeText(text);
            showToast();
        } catch (err) {
            console.warn('Clipboard API failed, falling back to execCommand', err);
            // Fallback
            outputReport.select();
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            showToast();
        }
    };

    // Event Listeners
    btnGenerate.addEventListener('click', generateReport);
    btnCopy.addEventListener('click', copyToClipboard);
    outputReport.addEventListener('input', updateCharCount);

});
