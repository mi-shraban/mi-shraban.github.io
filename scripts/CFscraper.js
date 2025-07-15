const CFScraper = (() => {
    // --- Configuration ---
    const CONFIG = {
        handle: "xordan.-",
        verdictFilter: "OK",
        maxSubmissions: 9999,
        containerId: "submissions-container",
        solutionBaseUrl: "https://github.com/monowarulIslamShraban/cf_solves/blob/main/"
    };

    // --- Private State ---
    let container;

    // --- Private Methods ---

    const renderLoading = () => {
        if (container) container.innerHTML = '<div class="loading">Fetching submissions...</div>';
    };

    const renderError = (message) => {
        if (container) container.innerHTML = `<div class="error">Error: ${message}</div>`;
    };

    const getApiUrl = () => {
        return `https://codeforces.com/api/user.status?handle=${CONFIG.handle}&from=1&count=${CONFIG.maxSubmissions}`;
    };

    const getLanguage = (lang) => {
        const lowerLang = lang.toLowerCase();
        if (lowerLang.includes("py")) return "Python";
        if (lang.includes("C++")) return "C++";
        return lang;
    };
    
    const getSolutionFileName = (language, id) => {
        if (language === "Python") return `${id}.py`;
        if (language === "C++") return `${id}.cpp`;
        return "";
    };

    const processSubmissions = (submissions) => {
        const seenProblems = new Set();
        const languageCount = {};
        const filteredSubmissions = [];

        submissions.forEach(sub => {
            const verdict = sub.verdict || "UNKNOWN";
            if (CONFIG.verdictFilter && verdict !== CONFIG.verdictFilter) return;

            const problem = sub.problem || {};
            const problemName = problem.name || "Unknown Problem";
            if (seenProblems.has(problemName)) return;

            seenProblems.add(problemName);

            const language = getLanguage(sub.programmingLanguage || "Unknown Lang");
            languageCount[language] = (languageCount[language] || 0) + 1;

            filteredSubmissions.push({
                sub_id: sub.id,
                name: problemName,
                id: `${problem.contestId || "N/A"}${problem.index || "?"}`,
                verdict,
                language,
                time: new Date(sub.creationTimeSeconds * 1000).toLocaleString()
            });
        });

        return { filteredSubmissions, languageCount };
    };

    const createStatsHtml = (solvedCount, langCount) => {
        const sortedLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
        const topLangs = sortedLangs.slice(0, 2).map(l => l[0]).join(', ');

        return `
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">${solvedCount}</div>
                    <div class="stat-label">Problems Solved</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${topLangs || 'N/A'}</div>
                    <div class="stat-label">Most Used Languages</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Object.keys(langCount).length}</div>
                    <div class="stat-label">Languages Used</div>
                </div>
            </div>
        `;
    };

    const createSubmissionHtml = (submission) => {
        const solveFile = getSolutionFileName(submission.language, submission.id);
        const contestId = submission.id.slice(0, -1);
        const problemIndex = submission.id.slice(-1);
        const problemUrl = `https://codeforces.com/contest/${contestId}/problem/${problemIndex}`;
        const solutionUrl = solveFile ? `${CONFIG.solutionBaseUrl}${solveFile}` : '#';

        return `
            <div class="submission-item">
                <div class="problem-title">
                    Problem:
                    <a href="${problemUrl}" target="_blank" class="problem-title2">
                        [${submission.name}]
                    </a>
                </div>
                <div class="submission-details">Language used: <b>${submission.language}</b></div>
                <div class="submission-details">Submitted on: <b>${submission.time}</b></div>
                ${solveFile ? `
                <div class="soln_link">
                    <a href="${solutionUrl}" target="_blank" class="solution-link">
                       View my Solution
                    </a>
                </div>` : ''}
            </div>
        `;
    };

    const renderSubmissions = (submissions, langCount) => {
        if (!submissions.length) {
            container.innerHTML = '<div class="error">No matching submissions found.</div>';
            return;
        }

        let html = createStatsHtml(submissions.length, langCount);
        html += submissions.map(createSubmissionHtml).join('');
        container.innerHTML = html;
    };

    // --- Public API ---
    const init = async () => {
        container = document.getElementById(CONFIG.containerId);
        if (!container) {
            console.error(`Container with id #${CONFIG.containerId} not found.`);
            return;
        }

        renderLoading();

        try {
            const response = await fetch(getApiUrl());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.status !== "OK") {
                renderError(`API Error: ${data.comment || "Unknown error"}`);
                return;
            }

            const { filteredSubmissions, languageCount } = processSubmissions(data.result);
            renderSubmissions(filteredSubmissions, languageCount);

        } catch (error) {
            console.error("Failed to fetch submissions:", error);
            renderError(error.message);
        }
    };

    return {
        init
    };
})();

document.addEventListener('DOMContentLoaded', CFScraper.init);