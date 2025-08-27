document.addEventListener("DOMContentLoaded", () => {
    const introPage = document.getElementById("introPage");
    const calculatorPage = document.getElementById("calculatorPage");
    const startBtn = document.getElementById("startBtn");
    const userNameEl = document.getElementById("userName");
    const numPoliciesEl = document.getElementById("numPolicies");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const policiesContainer = document.getElementById("policiesContainer");
    const totalWPCEl = document.getElementById("totalWPC");

    startBtn.addEventListener("click", () => {
        const name = userNameEl.value.trim();
        const numPolicies = parseInt(numPoliciesEl.value);

        if (!name || !numPolicies) {
            alert("Please enter your name and select number of policies.");
            return;
        }

        introPage.style.display = "none";
        calculatorPage.style.display = "block";
        welcomeMessage.textContent = `Hello ${name}, please enter details for ${numPolicies} policy(ies).`;

        for (let i = 1; i <= numPolicies; i++) {
            const policyDiv = document.createElement("div");
            policyDiv.classList.add("policy-block");
            policyDiv.innerHTML = `
              <h3>Policy ${i}</h3>
              <div class="form-grid">
                <div class="form-item">
                  <label>Category</label>
                  <select class="category">
                      <option value="">Select...</option>
                      <option value="BRO">BRO</option>
                      <option value="BURG_NRI">BURGUNDY & NRI</option>
                      <option value="PBRM">PBRM</option>
                      <option value="BURG_PRIV">BURGUNDY PRIVATE</option>
                      <option value="SALES_EXEC">SALES EXECUTIVES</option>
                      <option value="AVC_SKY">AVC SKY & NR MYRTLE</option>
                  </select>
                </div>

                <div class="form-item">
                  <label>Plan Type</label>
                  <select class="planType">
                      <option value="">Select...</option>
                      <option value="Participating">Participating</option>
                      <option value="NonParticipating">Non Participating</option>
                      <option value="ULIP">Unit Linked Insurance Plan</option>
                      <option value="TROP">TROP</option>
                      <option value="NonTROP">Non-TROP</option>
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
                    ${Array.from({length:30}, (_,i)=>`<option value="${i+1}">${i+1}</option>`).join("")}
                  </select>
                </div>
              </div>

              <div class="result-grid">
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

        policyBlocks.forEach(block => {
            const categoryEl = block.querySelector(".category");
            const planTypeEl = block.querySelector(".planType");
            const amountEl = block.querySelector(".amount");
            const pptEl = block.querySelector(".ppt");
            const wpcValueEl = block.querySelector(".wpcValue");
            const wpcPercentEl = block.querySelector(".wpcPercent");

            function calculateWPC() {
                const category = categoryEl.value.trim();
                const planType = planTypeEl.value.trim();
                const E10 = parseFloat(amountEl.value) || null;
                const I10 = parseInt(pptEl.value) || null;
                const M3 = category + planType;

                let result = "-";
                let percent = "-";

                if (!category || !planType || !E10 || !I10) {
                    wpcValueEl.textContent = "-";
                    wpcPercentEl.textContent = "-";
                    updateTotal();
                    return;
                }

                if (["BROParticipating", "BURG_NRIParticipating", "PBRMParticipating",
                    "BURG_PRIVParticipating", "SALES_EXECParticipating",
                    "AVC_SKYParticipating"].includes(M3)) {
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

                else if (["BRONONPART", "BURG_NRINONPART", "PBRMNONPART",
                    "BURG_PRIVNONPART", "SALES_EXECNONPART",
                    "AVC_SKYNONPART"].includes(M3)) {
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
                    percent = (E10 < 250000) ? 10 : 15;
                }

                else if (["BROTROP", "BURG_NRITROP", "PBRMTROP",
                    "BURG_PRIVTROP", "SALES_EXECTROP",
                    "AVC_SKYTROP"].includes(M3)) {
                    if (E10 < 5000) percent = 150;
                }

                else if (["BRONONTROP", "BURG_NRINONTROP", "PBRMNONTROP",
                    "BURG_PRIVNONTROP", "SALES_EXECNONTROP",
                    "AVC_SKYNONTROP"].includes(M3)) {
                    if (E10 < 5000) percent = 100;
                }

                else if (M3 === "BURG_NRIULIP") {
                    if (E10 < 500000) percent = 20;
                    else if (E10 < 750000) percent = 30;
                    else percent = 40;
                }

                else if (M3 === "BURG_PRIVULIP") {
                    if (E10 < 1500000) percent = 25;
                    else if (E10 < 3000000) percent = 35;
                    else percent = 45;
                }

                else if (M3 === "SALES_EXECULIP") {
                    percent = (E10 < 250000) ? 10 : 15;
                }

                else if (M3 === "AVC_SKYULIP") {
                    if (E10 < 190000) percent = 20;
                    else if (E10 < 250000) percent = 30;
                    else percent = 40;
                }

                else if (M3 === "AVC_SKYULIP_SUPER") {
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

                if (typeof percent === "number") {
                    result = E10 * (percent / 100);
                    result = Math.round(result * 100) / 100;
                }

                wpcValueEl.textContent = (typeof result === "number") ? result.toLocaleString("en-IN") : "-";
                wpcPercentEl.textContent = (typeof percent === "number") ? percent + "%" : "-";

                updateTotal();
            }

            [categoryEl, planTypeEl, amountEl, pptEl].forEach(el =>
                el.addEventListener("input", calculateWPC)
            );
        });
    }

    function updateTotal() {
        let total = 0;
        document.querySelectorAll(".policy-block .wpcValue").forEach(el => {
            const val = el.textContent.replace(/,/g,"");
            if (!isNaN(val) && val !== "-") total += parseFloat(val);
        });
        totalWPCEl.textContent = total ? total.toLocaleString("en-IN") : "-";
    }
});
