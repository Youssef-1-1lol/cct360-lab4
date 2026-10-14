// Storage can be unavailable in private browsing or restricted browser settings.
function readCompletedSessions() {
  try {
    const count = Number(localStorage.getItem("completedSessions"));
    return Number.isSafeInteger(count) && count >= 0 ? count : 0;
  } catch {
    return 0;
  }
}

function saveCompletedSessions() {
  try {
    localStorage.setItem("completedSessions", String(studyState.completedSessions));
  } catch {
    // The planner still works in memory when browser storage is unavailable.
  }
}

// This object stores the current state of the experience.
const studyState = {
  task: "",
  energy: 3,
  minutes: 30,
  distracted: false,
  currentPlan: null,
  completedSessions: readCompletedSessions()
};

const form = document.querySelector("#decision-form");
const energyInput = document.querySelector("#energy");
const energyValue = document.querySelector("#energy-value");
const resultPanel = document.querySelector("#result-panel");
const resultTitle = document.querySelector("#result-title");
const resultMessage = document.querySelector("#result-message");
const stateIcon = document.querySelector("#state-icon");
const planDetails = document.querySelector("#plan-details");
const planFocus = document.querySelector("#plan-focus");
const planLength = document.querySelector("#plan-length");
const planAction = document.querySelector("#plan-action");
const completeButton = document.querySelector("#complete-button");
const completedCount = document.querySelector("#completed-count");
const progressMessage = document.querySelector("#progress-message");
const resetButton = document.querySelector("#reset-button");

const plans = {
  recharge: {
    title: "Recharge first.",
    icon: "☾",
    message: "Pushing harder while drained usually creates weak work. Recover briefly, then return with a smaller target.",
    focus: "Recovery + light review",
    length: "10 minutes",
    action: "Drink water and review one page"
  },
  reset: {
    title: "Start with a reset sprint.",
    icon: "↻",
    message: "Your attention needs a quick win. Remove one distraction and complete one clearly defined task.",
    focus: "One small task",
    length: "15 minutes",
    action: "Put your phone away and set a timer"
  },
  steady: {
    title: "Choose steady progress.",
    icon: "→",
    message: "You have enough time and energy for a balanced session without overloading yourself.",
    focus: "Focused review",
    length: "30 minutes",
    action: "Write three goals before beginning"
  },
  deep: {
    title: "You are ready for deep focus.",
    icon: "◎",
    message: "Your energy and available time support a longer session. Protect that window and work on the hardest part first.",
    focus: "Difficult priority work",
    length: "50 minutes",
    action: "Close other tabs and begin immediately"
  }
};

function choosePlan() {
  // Conditional logic creates four possible outcomes.
  if (studyState.energy <= 2) {
    return "recharge";
  } else if (studyState.distracted || studyState.minutes === 15) {
    return "reset";
  } else if (studyState.energy >= 4 && studyState.minutes === 60) {
    return "deep";
  } else {
    return "steady";
  }
}

function renderPlan(planName) {
  const plan = plans[planName];

  resultPanel.className = `result-panel state-${planName}`;
  resultTitle.textContent = plan.title;
  stateIcon.textContent = plan.icon;
  resultMessage.textContent = `${studyState.task}: ${plan.message}`;
  planFocus.textContent = plan.focus;
  planLength.textContent = plan.length;
  planAction.textContent = plan.action;
  planDetails.hidden = false;
  completeButton.disabled = false;
  completeButton.textContent = "Mark session complete";
}

function renderProgress() {
  completedCount.textContent = studyState.completedSessions;

  if (studyState.completedSessions === 0) {
    progressMessage.textContent = "Finish a recommended session to start building momentum.";
  } else if (studyState.completedSessions < 3) {
    progressMessage.textContent = "Good start. Your previous action is now part of the experience.";
  } else if (studyState.completedSessions < 5) {
    progressMessage.textContent = "Momentum unlocked. Consistency is becoming your advantage.";
  } else {
    progressMessage.textContent = "Strong streak. You have proven that the plan can turn into action.";
  }
}

document.querySelector("#task").addEventListener("input", function (event) {
  event.target.setCustomValidity("");
});

energyInput.addEventListener("input", function () {
  energyValue.textContent = `${energyInput.value} / 5`;
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  studyState.task = document.querySelector("#task").value.trim();
  if (!studyState.task) {
    const taskInput = document.querySelector("#task");
    taskInput.setCustomValidity("Enter a task before building your session.");
    taskInput.reportValidity();
    return;
  }

  studyState.energy = Number(energyInput.value);
  studyState.minutes = Number(document.querySelector("#minutes").value);
  studyState.distracted = document.querySelector("#distracted").checked;
  studyState.currentPlan = choosePlan();

  renderPlan(studyState.currentPlan);
});

completeButton.addEventListener("click", function () {
  if (studyState.currentPlan === null) {
    return;
  }

  studyState.completedSessions += 1;
  saveCompletedSessions();
  renderProgress();

  completeButton.textContent = "Session recorded ✓";
  completeButton.disabled = true;
  studyState.currentPlan = null;
});

resetButton.addEventListener("click", function () {
  const shouldReset = window.confirm("Reset your completed session history?");

  if (shouldReset) {
    studyState.completedSessions = 0;
    saveCompletedSessions();
    renderProgress();
  }
});

renderProgress();
