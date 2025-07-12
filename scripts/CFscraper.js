async function fetchSubmissions() {
    const handle = "xordan.-";
    const verdictFilter = "OK";
    const maxSubmissions = 9999;
    const container = document.getElementById("submissions-container");

    container.innerHTML = '<div class="loading">Fetching submissions...</div>';

    const url = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=${maxSubmissions}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "OK") {
            container.innerHTML = `<div class="error">API Error: ${data.comment || "Unknown error"}</div>`;
            return;
        }

        const seen = new Set();
        const filtered = [];
        const languageCount = {};

        data.result.forEach(sub => {
            const verdict = sub.verdict || "UNKNOWN";
            const problem = sub.problem || {};
            const problemName = problem.name || "Unknown Problem";
            const contestId = problem.contestId || "N/A";
            const index = problem.index || "?";
            const lang = sub.programmingLanguage || "Unknown Lang";

            if (verdictFilter && verdict !== verdictFilter) return;
            if (seen.has(problemName)) return;

            seen.add(problemName);

            let language = "";
            if (lang.toLowerCase().includes("py")) {
                language = "Python";
            } else if (lang.includes("C++")) {
                language = "C++";
            } else {
                language = lang;
            }

            // Count languages
            languageCount[language] = (languageCount[language] || 0) + 1;

            filtered.push({
                sub_id: sub.id,
                name: problemName,
                id: `${contestId}${index}`,
                verdict,
                language: language
            });
        });

        if (!filtered.length) {
            container.innerHTML = '<div class="error">No matching submissions found.</div>';
            return;
        }

        // Sort languages and get top 2
        const sortedLanguageCount = Object.entries(languageCount).sort((a, b) => b[1] - a[1]);

        let html = `
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">${filtered.length}</div>
                    <div class="stat-label">Problems Solved</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${sortedLanguageCount[0][0]}, ${sortedLanguageCount[1][0]}</div>
                    <div class="stat-label">Most Used Languages</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Object.keys(languageCount).length}</div>
                    <div class="stat-label">Languages Used</div>
                </div>
            </div>
        `;


        filtered.forEach((entry, i) => {
            var solve_file = ""
            if (entry.language === "Python") {
                solve_file = `${entry.id}.py`;
            }
            else if (entry.language === "C++") {
                solve_file = `${entry.id}.cpp`;
            }

            html += `
                <div class="submission-item">
                    <div class="problem-title">
                        Problem:
                        <a href="https://codeforces.com/contest/${entry.id.slice(0, -1)}/problem/${entry.id.slice(-1)}" target="_blank" class="problem-title2">
                            [${entry.name}]
                        </a>
                    </div>
                    <div class="submission-details">Language: ${entry.language}</div>
                    <div class="tag">
                        <a href="https://github.com/monowarulIslamShraban/cf_solves/blob/main/${solve_file}" target="_blank" class="solution-link">
                           View my Solution
                        </a>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="error">Error: ${e.message}</div>`;
    }
}


// Load submissions when page loads
window.onload = () => {
    fetchSubmissions();
};
