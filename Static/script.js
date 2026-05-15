// ═══════════════════════════════════════
// RecruitIQ v2 Frontend Logic
// static/script.js
// ═══════════════════════════════════════

// ELEMENTS
const dropzone = document.getElementById("dropzone");
const resumeInput = document.getElementById("resumeInput");
const filePreview = document.getElementById("filePreview");
const fpName = document.getElementById("fpName");
const fpSize = document.getElementById("fpSize");
const fpRemove = document.getElementById("fpRemove");

const analyzeBtn = document.getElementById("analyzeBtn");
const btnTxt = document.querySelector(".btn-txt");
const btnSpin = document.querySelector(".btn-spin");

const errorBox = document.getElementById("errorBox");
const errorMsg = document.getElementById("errorMsg");

const jobDesc = document.getElementById("jobDesc");
const charCount = document.getElementById("charCount");

const resultsPanel = document.getElementById("resultsPanel");

const gaugeNum = document.getElementById("gaugeNum");
const gaugeFill = document.getElementById("gaugeFill");

const gradeChip = document.getElementById("gradeChip");

const barSkill = document.getElementById("barSkill");
const barEdu = document.getElementById("barEdu");
const barExp = document.getElementById("barExp");
const barBonus = document.getElementById("barBonus");

const valSkill = document.getElementById("valSkill");
const valEdu = document.getElementById("valEdu");
const valExp = document.getElementById("valExp");
const valBonus = document.getElementById("valBonus");

const recoText = document.getElementById("recoText");

const matchedBadges = document.getElementById("matchedBadges");
const missingBadges = document.getElementById("missingBadges");

const matchCount = document.getElementById("matchCount");
const missCount = document.getElementById("missCount");

const gapCard = document.getElementById("gapCard");
const gapList = document.getElementById("gapList");

const suggestCard = document.getElementById("suggestCard");
const suggestList = document.getElementById("suggestList");

const historyGrid = document.getElementById("historyGrid");

const themeBtn = document.getElementById("themeBtn");
const resetBtn = document.getElementById("resetBtn");
const signoutBtn = document.getElementById("signoutBtn");

const userChipName = document.getElementById("userChipName");
const rolePip = document.getElementById("rolePip");


// ═══════════════════════════════════════
// FILE UPLOAD
// ═══════════════════════════════════════

dropzone.addEventListener("click", () => {
    resumeInput.click();
});

resumeInput.addEventListener("change", () => {
    handleFile(resumeInput.files[0]);
});

dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
});

dropzone.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        resumeInput.files = e.dataTransfer.files;
        handleFile(file);
    }
});

function handleFile(file) {
    if (!file) return;

    fpName.textContent = file.name;
    fpSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;

    filePreview.style.display = "flex";
}

fpRemove.addEventListener("click", () => {
    resumeInput.value = "";
    filePreview.style.display = "none";
});


// ═══════════════════════════════════════
// CHARACTER COUNT
// ═══════════════════════════════════════

jobDesc.addEventListener("input", () => {
    charCount.textContent = `${jobDesc.value.length} characters`;
});


// ═══════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════

function showError(msg) {
    errorMsg.textContent = msg;
    errorBox.style.display = "flex";
}

function hideError() {
    errorBox.style.display = "none";
}


// ═══════════════════════════════════════
// ANALYZE
// ═══════════════════════════════════════

analyzeBtn.addEventListener("click", async () => {

    hideError();

    const file = resumeInput.files[0];
    const jd = jobDesc.value.trim();

    if (!file) {
        showError("Please upload a resume.");
        return;
    }

    if (!jd) {
        showError("Please enter job description.");
        return;
    }

    btnTxt.style.display = "none";
    btnSpin.style.display = "flex";

    try {

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("job_description", jd);

        const res = await fetch("/analyze", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            showError(data.error || "Analysis failed.");
            return;
        }

        renderResults(data);

        loadHistory();

    } catch (err) {
        showError("Server error.");
    } finally {
        btnTxt.style.display = "flex";
        btnSpin.style.display = "none";
    }

});


// ═══════════════════════════════════════
// RENDER RESULTS
// ═══════════════════════════════════════

function renderResults(data) {

    resultsPanel.style.display = "block";

    // SCORE
    gaugeNum.textContent = data.score;

    const circumference = 314.16;
    const offset = circumference - (data.score / 100) * circumference;

    gaugeFill.style.strokeDashoffset = offset;

    // GRADE
    if (data.score >= 85) {
        gradeChip.textContent = "Excellent";
    } else if (data.score >= 70) {
        gradeChip.textContent = "Good";
    } else if (data.score >= 50) {
        gradeChip.textContent = "Average";
    } else {
        gradeChip.textContent = "Needs Improvement";
    }

    // BARS
    barSkill.style.width = `${(data.skill_score / 60) * 100}%`;
    barEdu.style.width = `${(data.education_score / 20) * 100}%`;
    barExp.style.width = `${(data.experience_score / 20) * 100}%`;
    barBonus.style.width = `${(data.level_bonus / 5) * 100}%`;

    valSkill.textContent = `${data.skill_score}/60`;
    valEdu.textContent = `${data.education_score}/20`;
    valExp.textContent = `${data.experience_score}/20`;
    valBonus.textContent = `${data.level_bonus}/5`;

    // RECOMMENDATION
    recoText.textContent = data.recommendation;

    // MATCHED
    matchedBadges.innerHTML = "";
    data.matched_skills.forEach(skill => {
        matchedBadges.innerHTML += `
            <span class="skill-badge match">${skill}</span>
        `;
    });

    // MISSING
    missingBadges.innerHTML = "";
    data.missing_skills.forEach(skill => {
        missingBadges.innerHTML += `
            <span class="skill-badge miss">${skill}</span>
        `;
    });

    matchCount.textContent = data.matched_skills.length;
    missCount.textContent = data.missing_skills.length;

    // GAP ANALYSIS
    gapCard.style.display = "block";
    gapList.innerHTML = "";

    data.skill_gap.forEach(item => {

        let resources = "";

        item.resources.forEach(r => {
            resources += `
                <a href="${r.url}" target="_blank">${r.label}</a>
            `;
        });

        gapList.innerHTML += `
            <div class="gap-item">
                <div class="gap-top">
                    <h4>${item.skill}</h4>
                    <span>${item.priority}</span>
                </div>

                <p>Impact Score: ${item.impact}</p>
                <p>Learning Time: ${item.learn}</p>

                <div class="resource-links">
                    ${resources}
                </div>
            </div>
        `;
    });

    // SUGGESTIONS
    suggestCard.style.display = "block";
    suggestList.innerHTML = "";

    data.suggestions.forEach(s => {

        suggestList.innerHTML += `
            <div class="suggest-item">
                <div class="suggest-icon">${s.icon}</div>

                <div>
                    <h4>${s.title}</h4>
                    <p>${s.body}</p>
                </div>
            </div>
        `;
    });

}


// ═══════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════

async function loadHistory() {

    try {

        const res = await fetch("/history");
        const data = await res.json();

        if (!Array.isArray(data)) return;

        if (data.length === 0) {
            historyGrid.innerHTML =
                `<p class="no-history">No analyses yet.</p>`;
            return;
        }

        historyGrid.innerHTML = "";

        data.forEach(item => {

            historyGrid.innerHTML += `
                <div class="history-card">
                    <div class="history-score">${item.score}%</div>

                    <div class="history-info">
                        <p>${item.recommendation}</p>
                        <span>${item.timestamp}</span>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.log(err);
    }

}


// ═══════════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════════

themeBtn.addEventListener("click", () => {

    const current = document.documentElement.getAttribute("data-theme");

    if (current === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
    }

});


// ═══════════════════════════════════════
// RESET
// ═══════════════════════════════════════

resetBtn.addEventListener("click", () => {

    resumeInput.value = "";
    filePreview.style.display = "none";

    jobDesc.value = "";
    charCount.textContent = "0 characters";

    resultsPanel.style.display = "none";

});


// ═══════════════════════════════════════
// USER INFO
// ═══════════════════════════════════════

async function loadUser() {

    try {

        const res = await fetch("/api/me");
        const data = await res.json();

        if (data.authenticated) {

            userChipName.textContent = data.username;

            if (data.role === "admin") {
                rolePip.style.background = "red";
            } else {
                rolePip.style.background = "limegreen";
            }
        }

    } catch (err) {
        console.log(err);
    }

}

loadUser();


// ═══════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════

signoutBtn.addEventListener("click", async () => {

    await fetch("/api/logout", {
        method: "POST"
    });

    window.location.href = "/login";

});


// ═══════════════════════════════════════
// INITIAL LOAD
// ═══════════════════════════════════════

loadHistory();
