const AL_AIN_CAMP_END = "2026-08-19";
const ABU_DHABI_CAMP_END = "2026-08-23";

const ABU_DHABI_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
const AL_AIN_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday"];

function toLocalDate(dateInput) {
  if (!dateInput) return null;

  const normalized = String(dateInput).includes("T")
    ? String(dateInput)
    : `${String(dateInput)}T00:00:00`;
  const date = new Date(normalized);
  date.setHours(0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateInput(date) {
  return date.toISOString().split("T")[0];
}

function isFullCampPlan(planName = "") {
  return planName.toLowerCase().includes("full camp");
}

function is1DayPlan(planName = "") {
  const plan = planName.toLowerCase();
  if (isFullCampPlan(plan)) return false;
  return /\b1[\s-]?day/.test(plan);
}

function is3DaysPlan(planName = "") {
  const plan = planName.toLowerCase();
  if (isFullCampPlan(plan)) return false;
  return /\b3[\s-]?days?\b/.test(plan);
}

function validateSelectedDays(planName, location, selectedDays = []) {
  const days = selectedDays || [];
  const planNameLower = planName.toLowerCase();
  const is1Day = is1DayPlan(planNameLower);
  const is3Days = is3DaysPlan(planNameLower);

  if (isFullCampPlan(planNameLower)) {
    return null;
  }

  if (is1Day && days.length !== 1) {
    return "Please select exactly 1 attendance day for a 1-Day plan.";
  }

  if (is3Days && days.length !== 3) {
    return "Please select exactly 3 attendance days for a 3-Days plan.";
  }

  const validWeekdays =
    location === "alAin" ? AL_AIN_WEEKDAYS : ABU_DHABI_WEEKDAYS;

  for (const day of days) {
    if (!validWeekdays.includes(day)) {
      return location === "alAin"
        ? `Invalid day selected: "${day}". Only Monday–Thursday are allowed for Al Ain.`
        : `Invalid day selected: "${day}". Only Monday–Friday are allowed.`;
    }
  }

  return null;
}

function calculateExpiryDate(startDate, membershipPlan, location = "abuDhabi") {
  const start = toLocalDate(startDate);
  if (!start) {
    throw new Error("Invalid start date");
  }

  const planName = membershipPlan.toLowerCase();
  const end = new Date(start);

  if (isFullCampPlan(planName)) {
    return location === "alAin" ? AL_AIN_CAMP_END : ABU_DHABI_CAMP_END;
  }

  if (location === "alAin") {
    if (is1DayPlan(planName) || planName.includes("1-day")) {
      return formatDateInput(start);
    }
    if (planName.includes("1 week")) {
      end.setDate(start.getDate() + 3);
      return formatDateInput(end);
    }
    if (planName.includes("2 weeks")) {
      end.setDate(start.getDate() + 7);
      return formatDateInput(end);
    }
    if (planName.includes("1 month")) {
      end.setDate(start.getDate() + 15);
      return formatDateInput(end);
    }

    return formatDateInput(start);
  }

  // Abu Dhabi (Monday to Friday)
  if (is1DayPlan(planName) || planName.includes("1-day")) {
    return formatDateInput(start);
  }
  if (is3DaysPlan(planName) || planName.includes("3-day")) {
    end.setDate(start.getDate() + 2);
    return formatDateInput(end);
  }
  if (/\b5[\s-]?days?\b/.test(planName)) {
    end.setDate(start.getDate() + 4);
    return formatDateInput(end);
  }
  if (/\b10[\s-]?days?\b/.test(planName)) {
    end.setDate(start.getDate() + 9);
    return formatDateInput(end);
  }
  if (/\b20[\s-]?days?\b/.test(planName)) {
    end.setDate(start.getDate() + 19);
    return formatDateInput(end);
  }

  end.setDate(start.getDate() + 4);
  return formatDateInput(end);
}

function getPlanAccessPeriodLabel(planName, location, planDescription, fullCampDays) {
  const plan = planName ? planName.toLowerCase() : "";

  if (isFullCampPlan(plan)) {
    const campEnd = location === "alAin" ? "19 August 2026" : "23 August 2026";
    if (fullCampDays) {
      return `${fullCampDays} days access until ${campEnd}`;
    }
    return `Full camp access until ${campEnd}`;
  }

  if (planDescription) {
    return planDescription;
  }

  if (location === "alAin") {
    if (plan.includes("1 week") || plan.includes("4 days")) {
      return "4 days access within 1 week (Monday to Thursday)";
    }
    if (plan.includes("2 weeks") || plan.includes("8 days")) {
      return "8 days access within 2 weeks (Monday to Thursday)";
    }
    if (plan.includes("1 month") || plan.includes("16 days")) {
      return "16 days access within 1 month (Monday to Thursday each week)";
    }
    if (is1DayPlan(plan)) {
      return "1 day access (Monday to Thursday only)";
    }
  } else {
    if (is1DayPlan(plan)) return "1 day access (Monday to Friday only)";
    if (is3DaysPlan(plan)) {
      return "3 days access within one week (Monday to Friday only)";
    }
    if (plan.includes("5-day") || plan.includes("5 days")) {
      return "5 days access within one week (Monday to Friday only)";
    }
    if (plan.includes("10-day") || plan.includes("10 days")) {
      return "10 days access within two weeks";
    }
    if (plan.includes("20-day") || plan.includes("20 days")) {
      return "20 days access within two weeks from start date";
    }
  }

  return "Access period based on selected plan.";
}

module.exports = {
  AL_AIN_CAMP_END,
  ABU_DHABI_CAMP_END,
  isFullCampPlan,
  is1DayPlan,
  is3DaysPlan,
  validateSelectedDays,
  calculateExpiryDate,
  getPlanAccessPeriodLabel,
};
