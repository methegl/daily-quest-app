//localStorage.clear();
document.addEventListener("DOMContentLoaded",function () {

//全チェックボックス取得のconst祭り
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const progress = document.getElementById("progress");
const todayDate =document.getElementById("todayDate");
const sidejob25 = document.getElementById("sidejob_25");
const completeMessage = document.getElementById("completeMessage");
const logButtons = document.querySelectorAll(".logButton");
const todayLogList = document.getElementById("todayLogList");
const freeLogInput = document.getElementById("freeLogInput");
const addFreeLogButton = document.getElementById("addFreeLog");
const LOG_STORAGE_KEY = "todayLogs";
const expText =document.getElementById("expText");
const levelText = document.getElementById("levelText");
const guinnessForm = document.getElementById("guinnessForm");

const workModeBtn = document.getElementById("workModeBtn");
const restModeBtn = document.getElementById("restModeBtn");
const earlySleepBtn = document.getElementById("earlySleepBtn");

const questItems = document.querySelectorAll(".quest-item");
const workQuestItems = document.querySelectorAll(".quest-work");
const restQuestItmns = document.querySelectorAll(".quest-rest");
const baseQuestItems = document.querySelectorAll(".quest-base");
const normalSleepQuestItems = document.querySelectorAll(".quest-sleep-normal");
const earlySleepQuestItems = document.querySelectorAll(".quest-sleep-early");

//経験値データ
const levelTable = [
    0,     // Lv1
    100,   // Lv2
    220,   // Lv3
    360,   // Lv4
    520,   // Lv5
    700,   // Lv6
    900,   // Lv7
    1120,  // Lv8
    1360,  // Lv9
    1620,  // Lv10
    1900,  // Lv11
    2200,  // Lv12
    2520,  // Lv13
    2860,  // Lv14
    3220,  // Lv15
    3600,  // Lv16
    4000,  // Lv17
    4420,  // Lv18
    4860,  // Lv19
    5320,  // Lv20
    5800,  // Lv21
    6300,  // Lv22
    6820,  // Lv23
    7360,  // Lv24
    7920,  // Lv25
    8500,  // Lv26
    9100,  // Lv27
    9720,  // Lv28
    10360, // Lv29
    11020  // Lv30
];

const questExp = {
    work_start: 5,
    work_end: 10,
    report_start: 5,
    sidejob_25: 20,
    report_end: 10,
    laundry_start: 5,
    laundry_end: 15,
    bed_normal: 20,
    bed_early: 25
};

//ボタン関連
let currentMode = "work";
let isEarlySleep = false;

//データリセット
const todayKey = new Date().toISOString().slice(0, 10);
const savedDate = localStorage.getItem("lastDate");

if (savedDate !== todayKey) {
    checkboxes.forEach(box => {
        localStorage.removeItem(box.id);
        box.checked = false;
    });

    localStorage.setItem("lastDate", todayKey);
}

//保存されたデータを読み込む
checkboxes.forEach(box => {
    const saved = localStorage.getItem(box.id);

    if (saved === "true") {
        box.checked =true;
    }
});

//Modeボタン処理
workModeBtn.addEventListener("click", function () {
    currentMode = "work";
    updateQuestVisibility();
    updateProgress();
    updateExp();
});

restModeBtn.addEventListener("click", function () {
    currentMode = "rest";
    updateQuestVisibility();
    updateProgress();
    updateExp();
});

earlySleepBtn.addEventListener("click", function () {
    isEarlySleep = !isEarlySleep;
    updateQuestVisibility();
    updateProgress();
    updateExp();
});

//進行度
function updateProgress() {
    const visibleCheckboxes = Array.from(checkboxes).filter(box => {
        const questItem = box.closest(".quest-item");
        return questItem && questItem.style.display !== "none";
    });

    const total = visibleCheckboxes.length;
    const checked = visibleCheckboxes.filter(box => box.checked).length;
    
    progress.textContent = `進行度 ${checked} / ${total}`;

    if (checked === total && total > 0) {
        completeMessage.textContent = "🎉 COMPLETE!! 🎉";
    } else {
        completeMessage.textContent = "";
    }
}

//日付関連
function updateDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const weekNames = ["日","月","火","水","木","金","土"]
    const weekDay = weekNames[now.getDay()];

    todayDate.textContent = `${year}/${month}/${day} (${weekDay})`;
}


//チェックが変わったら保存
checkboxes.forEach(box => {
    box.addEventListener("change", function(){
        localStorage.setItem(box.id,box.checked);
        updateProgress();
        updateExp();
    });
});

logButtons.forEach(button => {
    button.addEventListener("click", function(){
        const task = button.dataset.task;
        const action = button.dataset.action;
        const time = getCurrentTime();

        addLog(`${time} ${task} ${action}`);

        if (action === "完了") {
            sidejob25.checked = true;
            localStorage.setItem(sidejob25.id, sidejob25.checked);
            updateProgress();
        }
    });
});

addFreeLogButton.addEventListener("click", function () {
    const text = freeLogInput.value.trim();

    if (text !== "") {
        const time = getCurrentTime();
        addLog(`${time} ${text}`);
        freeLogInput.value = "";
    }
});

const savedLogs =JSON.parse(localStorage.getItem(LOG_STORAGE_KEY)) || [];

savedLogs.forEach(log => {
    const li =document.createElement("li");
    li.textContent = log;
    todayLogList.appendChild(li);
});

updateQuestVisibility();
updateProgress();
updateDate();
updateExp();

//クエスト表示切替
function updateQuestVisibility() {
    workQuestItems.forEach(item => {
        item.style.display = currentMode === "work" ? "" : "none";
    });

    restQuestItmns.forEach(item => {
        item.style.display = currentMode === "rest" ? "" : "none";
    });

    normalSleepQuestItems.forEach(item => {
        item.style.display = isEarlySleep ? "none" : "";
    });

    earlySleepQuestItems.forEach(item => {
        item.style.display = isEarlySleep ? "" : "none";
    })
}

// 経験値計算関数
function getLevelFromExp(exp) {
    let level = 1;

    for (let i = 0; i < levelTable.length; i++) {
        if (exp >= levelTable[i]) {
            level = i + 1;
        }
    }

    return level;
}

function updateExp() {

    let exp = 0;

    // チェックされたクエストのEXPを合計
        const visibleCheckboxes = Array.from(checkboxes).filter(box => {
        const questItem = box.closest(".quest-item");
        return questItem && questItem.style.display !== "none";
    });

    visibleCheckboxes.forEach(box => {
        if (box.checked) {
            exp += questExp[box.id] || 0;
        }
    });

    // 全部達成ボーナス
    const total = visibleCheckboxes.length;
    const checked = visibleCheckboxes.filter(box => box.checked).length;

    if (checked === total && total > 0) {
        exp += 10;
    }

    // EXP表示
    expText.textContent = `EXP ${exp} / 100`;

    // EXP → Lv変換
    const level = getLevelFromExp(exp);

    // Lv表示
    levelText.textContent = `Lv${level}`;

    // ギネス形態更新
    updateGuinnessForm();
}

//進化関連
function updateGuinnessForm() {
    const level =Number(levelText.textContent.replace("Lv",""));

    if (level >= 30) {
        guinnessForm.textContent = "邪神と呼ばれるもの";
    } else if (level >= 25) {
        guinnessForm.textContent = "悪竜と呼ばれるもの";
    } else if (level >= 20) {
        guinnessForm.textContent = "魔族";
    } else if (level >= 15) {
        guinnessForm.textContent = "にんげん";
    } else if (level >= 10) {
        guinnessForm.textContent = "魔物と呼ばれるもの";
    } else if (level >= 5) {
        guinnessForm.textContent = "黒いスライム";
    } else {
        guinnessForm.textContent = "くろいぶよぶよ";
    }
}

//作業ログ関連
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes =String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function addLog(text) {
    const li = document.createElement("li");
    li.textContent = text;
    todayLogList.appendChild(li);

    const savedLogs = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY)) || [];
    savedLogs.push(text);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(savedLogs));
}
});
