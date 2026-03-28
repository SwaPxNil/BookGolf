const DEFAULT_WEEKS_AHEAD = 8;

const toDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildTemplateSlotForDate = (templateDate, baseDate) => {
  const template = toDate(templateDate);
  const base = toDate(baseDate);

  if (!template || !base) {
    return null;
  }

  const candidate = new Date(Date.UTC(
    base.getUTCFullYear(),
    base.getUTCMonth(),
    base.getUTCDate(),
    template.getUTCHours(),
    template.getUTCMinutes(),
    template.getUTCSeconds(),
    template.getUTCMilliseconds()
  ));

  let dayDiff = template.getUTCDay() - candidate.getUTCDay();
  if (dayDiff < 0) {
    dayDiff += 7;
  }

  candidate.setUTCDate(candidate.getUTCDate() + dayDiff);

  if (candidate < base) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
  }

  return candidate;
};

const generateRecurringSlots = (templateDates = [], options = {}) => {
  const {
    fromDate = new Date(),
    weeksAhead = DEFAULT_WEEKS_AHEAD,
  } = options;

  const start = toDate(fromDate);
  if (!start) {
    return [];
  }

  const generated = [];
  const dedupe = new Set();

  templateDates.forEach((templateDate) => {
    const firstOccurrence = buildTemplateSlotForDate(templateDate, start);
    if (!firstOccurrence) {
      return;
    }

    for (let weekOffset = 0; weekOffset < weeksAhead; weekOffset += 1) {
      const slot = new Date(firstOccurrence);
      slot.setUTCDate(slot.getUTCDate() + weekOffset * 7);

      if (slot < start) {
        continue;
      }

      const key = slot.toISOString();
      if (!dedupe.has(key)) {
        dedupe.add(key);
        generated.push(slot);
      }
    }
  });

  return generated.sort((a, b) => a.getTime() - b.getTime());
};

const slotMatchesTemplate = (slot, templateDates = []) => {
  const slotDate = toDate(slot);
  if (!slotDate) {
    return false;
  }

  return templateDates.some((template) => {
    const templateDate = toDate(template);
    if (!templateDate) {
      return false;
    }

    return (
      slotDate.getUTCDay() === templateDate.getUTCDay() &&
      slotDate.getUTCHours() === templateDate.getUTCHours() &&
      slotDate.getUTCMinutes() === templateDate.getUTCMinutes() &&
      slotDate.getUTCSeconds() === templateDate.getUTCSeconds() &&
      slotDate.getUTCMilliseconds() === templateDate.getUTCMilliseconds()
    );
  });
};

module.exports = {
  DEFAULT_WEEKS_AHEAD,
  generateRecurringSlots,
  slotMatchesTemplate,
};
