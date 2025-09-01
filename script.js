document.addEventListener("DOMContentLoaded", () => {
    const introPage = document.getElementById("introPage");
    const calculatorPage = document.getElementById("calculatorPage");
    const startBtn = document.getElementById("startBtn");
    const userNameEl = document.getElementById("userName");
    const employeeIDEl = document.getElementById("employeeID");
    const currentTargetEl = document.getElementById("currentTarget");
    const numPoliciesEl = document.getElementById("numPolicies");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const policiesContainer = document.getElementById("policiesContainer");
    const totalWPCEl = document.getElementById("totalWPC");
    const indiaAchieved = document.getElementById("indiaAchieved");
    const manilaAchieved = document.getElementById("manilaAchieved");
    const parisAchieved = document.getElementById("parisAchieved");
    const indiaTargetEl = document.getElementById("indiaTarget");
    const indiaShortfallEl = document.getElementById("indiaShortfall");
    const manilaTargetEl = document.getElementById("manilaTarget");
    const manilaShortfallEl = document.getElementById("manilaShortfall");
    const parisTargetEl = document.getElementById("parisTarget");
    const parisShortfallEl = document.getElementById("parisShortfall");

    let selectedCategory = "";
    let currentTarget = 0;

    const requirements = {
        "BRO": { india: 650000, manila: 1100000, paris: 2500000 },
        "BURG_NRI": { india: 1500000, manila: 2400000, paris: 5800000 },
        "PBRM": { india: 1300000, manila: 2000000, paris: 4500000 },
        "BURG_PRIV": { india: 1700000, manila: 2500000, paris: 6000000 },
        "SALES_EXEC": { india: 600000, manila: 100000, paris: 2200000 },
        "AVC_SKY": { india: 3400000, manila: 5000000, paris: 12000000 }
    };

    let hasUploadedToAirtable = false;
    let uploadingInProgress = false;
    let uploadTimeout = null;

    const AIRTABLE_URL = "https://api.airtable.com/v0/app5nV3Y1Wv8AJGZV/tbl8MQJZ9b0RlEnso";
    const AIRTABLE_HEADERS = {
        "Authorization": "Bearer patNS2S4xcYdiUkAd.6367601a072926d8e64bcbd27d37f2e504dd50fbff9e21a83ba8be27f7ab41c6",
        "Content-Type": "application/json"
    };

    // Are ALL policy blocks filled? (first category + planType + amount>0 + ppt on every block)
    function allPoliciesComplete() {
        const blocks = document.querySelectorAll(".policy-block");
        if (!blocks.length) return false;

        // First policy must have a category selected
        const firstCategory = blocks[0].querySelector(".category");
        if (!firstCategory || !firstCategory.value.trim()) return false;

        // Every block: planType, amount>0, ppt required
        for (const block of blocks) {
            const planType = block.querySelector(".planType")?.value.trim();
            const amountVal = block.querySelector(".amount")?.value;
            const ppt = block.querySelector(".ppt")?.value.trim();

            if (!planType || !ppt) return false;
            const amount = parseFloat(amountVal);
            if (!(amount > 0)) return false;
        }
        return true;
    }

    // Build a clean JSON string of all policy inputs (plus computed WPC shown on screen)
    function buildAirtableContent() {
        const blocks = document.querySelectorAll(".policy-block");
        const firstCategoryEl = blocks[0]?.querySelector(".category");
        const categoryValue = firstCategoryEl?.value || "";
        const categoryText = firstCategoryEl?.options[firstCategoryEl.selectedIndex]?.text || "-";

        const policies = [];
        blocks.forEach((block, idx) => {
            const planTypeEl = block.querySelector(".planType");
            const planTypeText = planTypeEl?.options[planTypeEl.selectedIndex]?.text || "";
            const premium = block.querySelector(".amount")?.value || "";
            const pptYears = block.querySelector(".ppt")?.value || "";
            const wpcShown = block.querySelector(".wpcValue")?.innerText || "-";
            const wpcPercentShown = block.querySelector(".wpcPercent")?.innerText || "-";

            policies.push({
                policyIndex: idx + 1,
                categoryValue,
                categoryText,
                planType: planTypeText,
                premium,
                pptYears,
                wpc: wpcShown,
                wpcPercent: wpcPercentShown
            });
        });

        return JSON.stringify({ categoryValue, categoryText, policies }, null, 2);
    }

    function maybeUploadToAirtable() {
        if (hasUploadedToAirtable || uploadingInProgress) return;
        if (!allPoliciesComplete()) return;

        // clear previous timer if user is still typing
        clearTimeout(uploadTimeout);

        // wait 6 seconds before uploading
        uploadTimeout = setTimeout(() => {
            uploadToAirtable();
        }, 4000);
    }

    // Try uploading once, right when everything becomes complete
    async function uploadToAirtable() {
        if (hasUploadedToAirtable || uploadingInProgress) return;

        const name = (userNameEl.value || "").trim();
        const employeeID = (employeeIDEl.value || "").trim();
        if (!name || !employeeID) return;

        const content = buildAirtableContent();
        const payload = {
            records: [{
                fields: {
                    "fldyUDMDFno06AKQJ": name,
                    "fldlKmOW0yP5qhPzm": employeeID,
                    "fldJadwSg4jzYRTnP": new Date().toISOString(),
                    "fldESWRTe5RCmqY1m": content
                }
            }]
        };

        uploadingInProgress = true;

        try {
            const res = await fetch(AIRTABLE_URL, {
                method: "POST",
                headers: AIRTABLE_HEADERS,
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                hasUploadedToAirtable = true;
                console.log("✅ Airtable upload complete", data);
            } else {
                console.error("Airtable error:", data);
            }
        } catch (err) {
            console.error("Airtable network error:", err);
        } finally {
            uploadingInProgress = false;
        }
    }

    startBtn.addEventListener("click", () => {
        const name = userNameEl.value.trim();
        const employeeID = employeeIDEl.value.trim();
        const numPolicies = parseInt(numPoliciesEl.value);
        currentTarget = parseFloat(currentTargetEl.value) || 0;

        if (!name || !employeeID || !numPolicies) {
            alert("Please enter your name, employee ID and select number of policies.");
            return;
        }

        hasUploadedToAirtable = false; // reset for this run

        introPage.style.display = "none";
        calculatorPage.style.display = "block";
        welcomeMessage.textContent = `Hello ${name}, please enter details for ${numPolicies} policy(ies).`;

        policiesContainer.innerHTML = "";

        for (let i = 1; i <= numPolicies; i++) {
            const policyDiv = document.createElement("div");
            policyDiv.classList.add("policy-block");
            const isFirstBlock = i === 1;
            const categoryInput = `
                <div class="form-item">
                  <label>Category</label>
                  <select class="category${!isFirstBlock ? ' greyed-out' : ''}" ${!isFirstBlock ? 'disabled' : ''}>
                      <option value="">Select...</option>
                      <option value="BRO">BRO</option>
                      <option value="BURG_NRI">BURGUNDY & NRI</option>
                      <option value="PBRM">PBRM</option>
                      <option value="BURG_PRIV">BURGUNDY PRIVATE</option>
                      <option value="SALES_EXEC">SALES EXECUTIVES</option>
                      <option value="AVC_SKY">AVC SKY & NR MYRTLE</option>
                  </select>
                </div>
            `;
            policyDiv.innerHTML = `
              <h3>Policy ${i}</h3>
              <div class="form-grid">
                ${categoryInput}
                <div class="form-item">
                  <label>Plan Type</label>
                  <select class="planType">
                      <option value="">Select...</option>
                      <option value="Participating">Participating</option>
                      <option value="NonParticipating">Non Participating</option>
                      <option value="ULIP">Unit Linked Insurance Plan</option>
                      <option value="TROP">TROP</option>
                      <option value="NonTROP">Term</option>
                      <option value="ULIP_SUPER">Unit Linked Insurance Plan (Super Solution)</option>
                  </select>
                </div>
                <div class="form-item">
                  <label>Premium</label>
                  <div class="input-prefix">
                    <span>₹</span>
                    <input type="number" class="amount" placeholder="Enter Premium">
                  </div>
                </div>
                <div class="form-item">
                  <label>PPT (In Years)</label>
                  <select class="ppt">
                    <option value="">Select...</option>
                    ${Array.from({ length: 30 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}
                  </select>
                </div>
              </div>
              <div class="form-grid">
                <div class="result-header">WPC</div>
                <div class="result-header">WPC %</div>
                <div class="result-value wpcValue">-</div>
                <div class="result-value wpcPercent">-</div>
              </div>
              <hr>
            `;
            policiesContainer.appendChild(policyDiv);
        }

        attachCalculators();
    });

    function attachCalculators() {
        const policyBlocks = document.querySelectorAll(".policy-block");

        // Define calculateWPC outside the forEach loop
        function calculateWPC(block, index) {
            const categoryEl = block.querySelector(".category");
            const planTypeEl = block.querySelector(".planType");
            const amountEl = block.querySelector(".amount");
            const pptEl = block.querySelector(".ppt");
            const wpcValueEl = block.querySelector(".wpcValue");
            const wpcPercentEl = block.querySelector(".wpcPercent");

            const category = index === 0 ? categoryEl?.value.trim() : selectedCategory;
            const planType = planTypeEl.value.trim();
            const E10 = parseFloat(amountEl.value) || null;
            const I10 = parseInt(pptEl.value) || null;
            const M3 = category + planType;

            let result = "-";
            let percent = "-";

            // Handle special cases
            if (!E10 && !I10) {
                wpcValueEl.textContent = "Updated Premium & PPT";
                wpcPercentEl.textContent = "-";
                updateTotalAndShortfalls();
                maybeUploadToAirtable();
                return;
            }
            if (!E10) {
                wpcValueEl.textContent = "Update Premium";
                wpcPercentEl.textContent = "-";
                updateTotalAndShortfalls();
                maybeUploadToAirtable();
                return;
            }
            if (I10 === 0 || I10 === null) {
                wpcValueEl.textContent = "Update PPT";
                wpcPercentEl.textContent = "-";
                updateTotalAndShortfalls();
                maybeUploadToAirtable();
                return;
            }

            // Handle plan types
            if ([
                "BROParticipating", "BURG_NRIParticipating", "PBRMParticipating",
                "BURG_PRIVParticipating", "SALES_EXECParticipating", "AVC_SKYParticipating"
            ].includes(M3)) {
                if (I10 <= 6 && E10 <= 89000) percent = 45;
                else if (I10 <= 6 && E10 <= 149000) percent = 55;
                else if (I10 <= 6 && E10 >= 15000) percent = 65;
                else if (I10 <= 9 && E10 <= 89000) percent = 55;
                else if (I10 <= 9 && E10 <= 149000) percent = 70;
                else if (I10 <= 9 && E10 >= 15000) percent = 85;
                else if (I10 <= 11 && E10 <= 89000) percent = 70;
                else if (I10 <= 11 && E10 <= 149000) percent = 85;
                else if (I10 <= 11 && E10 >= 15000) percent = 105;
                else if (I10 >= 12 && E10 <= 89000) percent = 75;
                else if (I10 >= 12 && E10 <= 149000) percent = 100;
                else if (I10 >= 12 && E10 >= 15000) percent = 125;
            }
            else if ([
                "BRONonParticipating", "BURG_NRINonParticipating", "PBRMNonParticipating",
                "BURG_PRIVNonParticipating", "SALES_EXECNonParticipating", "AVC_SKYNonParticipating"
            ].includes(M3)) {
                if (I10 <= 6 && E10 <= 89000) percent = 50;
                else if (I10 <= 6 && E10 <= 149000) percent = 60;
                else if (I10 <= 6 && E10 >= 15000) percent = 70;
                else if (I10 <= 9 && E10 <= 89000) percent = 60;
                else if (I10 <= 9 && E10 <= 149000) percent = 75;
                else if (I10 <= 9 && E10 >= 15000) percent = 90;
                else if (I10 <= 11 && E10 <= 89000) percent = 80;
                else if (I10 <= 11 && E10 <= 149000) percent = 95;
                else if (I10 <= 11 && E10 >= 15000) percent = 115;
                else if (I10 >= 12 && E10 <= 89000) percent = 85;
                else if (I10 >= 12 && E10 <= 149000) percent = 110;
                else if (I10 >= 12 && E10 >= 15000) percent = 135;
            }
            else if (M3 === "BROULIP") {
                percent = E10 < 250000 ? 10 : 15;
            }
            else if ([
                "BROTROP", "BURG_NRITROP", "PBRMTROP",
                "BURG_PRIVTROP", "SALES_EXECTROP", "AVC_SKYTROP"
            ].includes(M3)) {
                if (E10 < 5000) percent = 150;
                else {
                    wpcValueEl.textContent = "Premium Should be <5K";
                    wpcPercentEl.textContent = "-";
                    updateTotalAndShortfalls();
                    maybeUploadToAirtable();
                    return;
                }
            }
            else if ([
                "BRONonTROP", "BURG_NRINonTROP", "PBRMNonTROP",
                "BURG_PRIVNonTROP", "SALES_EXECNonTROP", "AVC_SKYNonTROP"
            ].includes(M3)) {
                if (E10 < 5000) percent = 100;
                else {
                    wpcValueEl.textContent = "Premium Should be <5K";
                    wpcPercentEl.textContent = "-";
                    updateTotalAndShortfalls();
                    maybeUploadToAirtable();
                    return;
                }
            }
            else if (M3 === "BURG_NRIULIP") {
                if (E10 < 500000) percent = 20;
                else if (E10 < 750000) percent = 30;
                else if (E10 >= 750000) percent = 40;
            }
            else if (M3 === "BURG_PRIVULIP") {
                if (E10 < 1500000) percent = 25;
                else if (E10 < 3000000) percent = 35;
                else if (E10 >= 3000000) percent = 45;
            }
            else if (M3 === "SALES_EXECULIP") {
                if (E10 < 250000) percent = 10;
                else if (E10 >= 250000) percent = 15;
            }
            else if (M3 === "AVC_SKYULIP") {
                if (E10 < 190000) percent = 20;
                else if (E10 < 250000) percent = 30;
                else if (E10 >= 250000) percent = 40;
            }
            else if ([
                "PBRMULIP_SUPER", "AVC_SKYULIP_SUPER"
            ].includes(M3)) {
                if (I10 <= 6 && E10 <= 89000) percent = 40;
                else if (I10 <= 6 && E10 <= 149000) percent = 50;
                else if (I10 <= 6 && E10 >= 150000) percent = 65;
                else if (I10 <= 9 && E10 <= 89000) percent = 50;
                else if (I10 <= 9 && E10 <= 149000) percent = 65;
                else if (I10 <= 9 && E10 >= 150000) percent = 80;
                else if (I10 <= 11 && E10 <= 89000) percent = 65;
                else if (I10 <= 11 && E10 <= 149000) percent = 80;
                else if (I10 <= 11 && E10 >= 150000) percent = 100;
                else if (I10 >= 12 && E10 <= 89000) percent = 70;
                else if (I10 >= 12 && E10 <= 149000) percent = 95;
                else if (I10 >= 12 && E10 >= 150000) percent = 115;
            }
            else if (M3 === "PBRMULIP") {
                if (E10 <= 249000) percent = 20;
                else if (E10 <= 250000) percent = 30;
                else if (E10 >= 500000) percent = 40;
            }

            if (typeof percent === "number") {
                result = E10 * (percent / 100);
                result = Math.round(result * 100) / 100;
            }

            wpcValueEl.textContent = (typeof result === "number") ? result.toLocaleString("en-IN") : "-";
            wpcPercentEl.textContent = (typeof percent === "number") ? percent + "%" : "-";

            updateTotalAndShortfalls();
            maybeUploadToAirtable();
        }

        const firstCategoryEl = policyBlocks[0]?.querySelector(".category");
        if (firstCategoryEl) {
            firstCategoryEl.addEventListener("input", () => {
                selectedCategory = firstCategoryEl.value.trim();

                policyBlocks.forEach((block, index) => {
                    if (index > 0) {
                        const categorySelect = block.querySelector(".category");
                        if (categorySelect) {
                            categorySelect.value = selectedCategory || "";
                        }
                    }
                    calculateWPC(block, index);
                });

                updateTotalAndShortfalls();
                maybeUploadToAirtable();
            });
        }

        policyBlocks.forEach((block, index) => {
            const categoryEl = block.querySelector(".category");
            const planTypeEl = block.querySelector(".planType");
            const amountEl = block.querySelector(".amount");
            const pptEl = block.querySelector(".ppt");

            [planTypeEl, amountEl, pptEl].forEach(el =>
                el.addEventListener("input", () => calculateWPC(block, index))
            );

            if (index === 0 && categoryEl) {
                categoryEl.addEventListener("input", () => calculateWPC(block, index));
            }

            // Initialize calculation for the block
            calculateWPC(block, index);
        });
    }

    function updateTotalAndShortfalls() {
        let totalWPC = 0;
        document.querySelectorAll(".policy-block .wpcValue").forEach(el => {
            const val = el.textContent.replace(/,/g, "");
            if (!isNaN(val) && val !== "-" && !val.includes("Update") && !val.includes("Premium Should")) {
                totalWPC += parseFloat(val);
            }
        });

        totalWPCEl.textContent = totalWPC ? totalWPC.toLocaleString("en-IN") : "-";

        const finalTarget = currentTarget + totalWPC;

        if (finalTarget) {
            indiaAchieved.textContent = finalTarget.toLocaleString("en-IN");
            manilaAchieved.textContent = finalTarget.toLocaleString("en-IN");
            parisAchieved.textContent = finalTarget.toLocaleString("en-IN");
        } else {
            indiaAchieved.textContent = "-";
            manilaAchieved.textContent = "-";
            parisAchieved.textContent = "-";
        }

        if (selectedCategory && requirements[selectedCategory]) {
            const req = requirements[selectedCategory];
            indiaTargetEl.textContent = req.india.toLocaleString("en-IN");
            manilaTargetEl.textContent = req.manila.toLocaleString("en-IN");
            parisTargetEl.textContent = req.paris.toLocaleString("en-IN");

            const indiaShortfall = req.india - finalTarget;
            const manilaShortfall = req.manila - finalTarget;
            const parisShortfall = req.paris - finalTarget;

            indiaShortfallEl.textContent = indiaShortfall >= 0 ? indiaShortfall.toLocaleString("en-IN") : "0";
            manilaShortfallEl.textContent = manilaShortfall >= 0 ? manilaShortfall.toLocaleString("en-IN") : "0";
            parisShortfallEl.textContent = parisShortfall >= 0 ? parisShortfall.toLocaleString("en-IN") : "0";
        } else {
            indiaTargetEl.textContent = "-";
            indiaShortfallEl.textContent = "-";
            manilaTargetEl.textContent = "-";
            manilaShortfallEl.textContent = "-";
            parisTargetEl.textContent = "-";
            parisShortfallEl.textContent = "-";
        }
    }

    document.getElementById("downloadBtn").addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        const userName = userNameEl.value || userNameEl.innerText || "User";
        let yOffset = 20;
        const lineHeight = 8;
        const pageHeight = pdf.internal.pageSize.getHeight() - 20;

        // Add heading
        pdf.setFontSize(14);
        pdf.text(`WPC Calculator for: ${userName}`, 10, yOffset);
        yOffset += lineHeight * 2;

        const policies = document.querySelectorAll("#policiesContainer .policy-block");
        pdf.setFontSize(12);
        pdf.text("Policies:", 10, yOffset);
        yOffset += lineHeight;

        let firstCategory = "-";
        if (policies.length > 0) {
            const firstCategoryEl = policies[0].querySelector(".category");
            firstCategory = firstCategoryEl ? firstCategoryEl.options[firstCategoryEl.selectedIndex]?.text : "-";
        }

        policies.forEach((p, i) => {
            const planTypeEl = p.querySelector(".planType");
            const planType = planTypeEl ? planTypeEl.options[planTypeEl.selectedIndex]?.text : "-";
            const ppt = p.querySelector(".ppt")?.value || "-";
            const premium = p.querySelector(".amount")?.value || "-";
            const wpc = p.querySelector(".wpcValue")?.innerText || "-";
            const wpcPercent = p.querySelector(".wpcPercent")?.innerText || "-";

            if (yOffset > pageHeight) {
                pdf.addPage();
                yOffset = 20;
            }

            pdf.setFont(undefined, "bold");
            pdf.text(`Policy ${i + 1}`, 10, yOffset);
            pdf.setFont(undefined, "normal");
            yOffset += lineHeight;

            pdf.text(`Category: ${firstCategory}`, 15, yOffset); yOffset += lineHeight;
            pdf.text(`Plan Type: ${planType}`, 15, yOffset); yOffset += lineHeight;
            pdf.text(`PPT (In Years): ${ppt}`, 15, yOffset); yOffset += lineHeight;
            pdf.text(`Premium: ${premium}`, 15, yOffset); yOffset += lineHeight;
            pdf.text(`WPC: ${wpc}`, 15, yOffset); yOffset += lineHeight;
            pdf.text(`WPC %: ${wpcPercent}`, 15, yOffset); yOffset += lineHeight * 2;
        });

        // Add results table if available
        const table = document.querySelector(".result-table");
        if (table) {
            const headers = [...table.querySelectorAll("thead th")].map(th => th.innerText);
            const rows = [...table.querySelectorAll("tbody tr")].map(tr =>
                [...tr.querySelectorAll("td")].map(td => td.innerText)
            );

            pdf.autoTable({
                head: [headers],
                headStyles: {
                    fillColor: [136, 26, 68],
                    textColor: [255, 255, 255]
                },
                body: rows,
                startY: yOffset,
                styles: { fontSize: 10, cellPadding: 2 },
                margin: { left: 10, right: 10 },
                theme: "grid"
            });
        }

        pdf.save(`${userName}_WPC_Calculation.pdf`);
    });
});
