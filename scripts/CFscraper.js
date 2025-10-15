
const CFScraper = (() => {
    // --- Configuration ---
    const CONFIG = {
        handle: "xordan.-",
        verdictFilter: "OK",
        maxSubmissions: 3000,
        containerId: "submissions-container",
        solutionBaseUrl: "https://github.com/mi-shraban/cf_solves/blob/main/",
        pageSize: 14
    };

    // --- Private State ---
    let container;
    let state = {
        submissions: [],
        languageCount: {},
        currentPage: 1,
    };

    // --- Private Helpers ---
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
        const lowerLang = (lang || "").toLowerCase();
        if (lowerLang.includes("py")) return "Python";
        if (lowerLang.includes("c++")) return "C++";
        if (lowerLang.includes('javascript')) return "JavaScript";
        return lang || "Unknown";
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
            if (seenProblems.has(problemName)) return; // keep first AC only

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
            <div class="stat-container">
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

    const createPaginationHtml = (currentPage, totalPages) => {
        const maxButtons = 7; // up to 7 numbered pages visible
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        let html = `<div class="pagination">`;

        if (currentPage > 1) {
            html += `<button class="page-btn" data-action="first" aria-label="First page">First</button>`;
            html += `<button class="page-btn" data-action="prev" aria-label="Previous page">&laquo;</button>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}" aria-label="Page ${i}">
                    ${i}
                </button>`;
        }

        if (currentPage < totalPages) {
            html += `<button class="page-btn" data-action="next" aria-label="Next page">&raquo;</button>`;
            html += `<button class="page-btn" data-action="last" aria-label="Last page">Last</button>`;
        }

        html += `</div>`;
        return html;
    };


    const renderSubmissionsPage = () => {
        const total = state.submissions.length;
        const totalPages = Math.max(1, Math.ceil(total / CONFIG.pageSize));
        state.currentPage = Math.min(Math.max(1, state.currentPage), totalPages);

        const start = (state.currentPage - 1) * CONFIG.pageSize;
        const end = Math.min(start + CONFIG.pageSize, total);
        const pageItems = state.submissions.slice(start, end);

        // Build HTML
        let html = createStatsHtml(total, state.languageCount);
        html += pageItems.map(createSubmissionHtml).join('');
        html += createPaginationHtml(state.currentPage, totalPages);

        container.innerHTML = html;

        // Attach event listeners (numbered + actions)
        container.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                const page = parseInt(btn.dataset.page, 10);
                const action = btn.dataset.action;

                if (!isNaN(page)) {
                    // Clicked a numbered page
                    state.currentPage = page;
                } else if (action === 'first') {
                    state.currentPage = 1;
                } else if (action === 'prev') {
                    state.currentPage = Math.max(1, state.currentPage - 1);
                } else if (action === 'next') {
                    state.currentPage = Math.min(totalPages, state.currentPage + 1);
                } else if (action === 'last') {
                    state.currentPage = totalPages;
                }

                renderSubmissionsPage();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
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
            state.submissions = filteredSubmissions;
            state.languageCount = languageCount;
            state.currentPage = 1;
            renderSubmissionsPage();

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