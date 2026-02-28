/**
 * Input validation & sanitization middleware helpers
 */

// Strip HTML tags to prevent XSS in stored text
export function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
}

// Sanitize an object's string fields (shallow)
export function sanitizeBody(fields) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') return next();
    for (const field of fields) {
      if (typeof req.body[field] === 'string') {
        req.body[field] = stripHtml(req.body[field]);
      }
    }
    next();
  };
}

// Validate email format
export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// Validate time format HH:MM or HH:MM:SS
export function isValidTime(time) {
  return typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time);
}

// Validate days array (0-6)
export function isValidDays(days) {
  return Array.isArray(days) && days.every(d => Number.isInteger(d) && d >= 0 && d <= 6);
}

// Validate alarm name (max 100 chars, no HTML)
export function isValidName(name) {
  return typeof name === 'string' && name.length > 0 && name.length <= 100;
}

// General length check
export function maxLength(str, max) {
  return typeof str === 'string' && str.length <= max;
}

// Validate alarm creation/update body
export function validateAlarmBody(req, res, next) {
  const b = req.body;

  if (b.name !== undefined) {
    b.name = stripHtml(b.name);
    if (!isValidName(b.name)) return res.status(400).json({ error: 'Name must be 1-100 characters' });
  }

  if (b.time !== undefined && !isValidTime(b.time)) {
    return res.status(400).json({ error: 'Time must be in HH:MM or HH:MM:SS format' });
  }

  if (b.days !== undefined && !isValidDays(b.days)) {
    return res.status(400).json({ error: 'Days must be an array of integers 0-6' });
  }

  if (b.snoozeDuration !== undefined) {
    const d = parseInt(b.snoozeDuration);
    if (isNaN(d) || d < 1 || d > 60) return res.status(400).json({ error: 'Snooze duration must be 1-60 minutes' });
    b.snoozeDuration = d;
  }

  if (b.briefingMode !== undefined && !['none', 'short', 'standard', 'auto'].includes(b.briefingMode)) {
    return res.status(400).json({ error: 'Invalid briefing mode' });
  }

  if (b.sound !== undefined) {
    b.sound = stripHtml(b.sound);
    if (!maxLength(b.sound, 50)) return res.status(400).json({ error: 'Sound name too long' });
  }

  next();
}

// Validate auth body
export function validateAuthBody(req, res, next) {
  const b = req.body;

  if (b.email !== undefined) {
    b.email = stripHtml(b.email).toLowerCase().trim();
    if (!isValidEmail(b.email)) return res.status(400).json({ error: 'Invalid email format' });
  }

  if (b.password !== undefined) {
    if (typeof b.password !== 'string' || b.password.length < 6 || b.password.length > 128) {
      return res.status(400).json({ error: 'Password must be 6-128 characters' });
    }
  }

  if (b.name !== undefined) {
    b.name = stripHtml(b.name);
    if (!maxLength(b.name, 100)) return res.status(400).json({ error: 'Name too long (max 100)' });
  }

  next();
}

// Validate briefing body
export function validateBriefingBody(req, res, next) {
  const b = req.body;

  if (b.content !== undefined) {
    if (typeof b.content !== 'string' || b.content.length > 50000) {
      return res.status(400).json({ error: 'Briefing content too long (max 50000)' });
    }
  }

  if (b.modules !== undefined) {
    if (!Array.isArray(b.modules) || b.modules.length > 20) {
      return res.status(400).json({ error: 'Modules must be an array (max 20)' });
    }
    b.modules = b.modules.filter(m => typeof m === 'string').map(m => stripHtml(m).slice(0, 50));
  }

  if (b.audioUrl !== undefined && b.audioUrl !== null) {
    if (typeof b.audioUrl !== 'string' || b.audioUrl.length > 2000) {
      return res.status(400).json({ error: 'Audio URL too long' });
    }
  }

  next();
}
