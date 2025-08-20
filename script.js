document.addEventListener("DOMContentLoaded", () => {
    const categoryEl = document.getElementById("option1");
    const planTypeEl = document.getElementById("option2");
    const amountEl = document.getElementById("amount");
    const pptEl = document.getElementById("option4");

    const wpcValueEl = document.getElementById("wpcValue");
    const wpcPercentEl = document.getElementById("wpcPercent");

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
        }

        wpcValueEl.textContent = result;
        wpcPercentEl.textContent = (typeof percent === "number") ? percent + "%" : "-";
    }

    categoryEl.addEventListener("change", calculateWPC);
    planTypeEl.addEventListener("change", calculateWPC);
    amountEl.addEventListener("input", calculateWPC);
    pptEl.addEventListener("change", calculateWPC);
});
