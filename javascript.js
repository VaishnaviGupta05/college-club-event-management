const STORAGE_KEYS = {
  events: 'campuspulse-events',
  registrations: 'campuspulse-registrations'
};

const defaultEvents = [
  {
    id: 'evt-1',
    name: 'AI Innovation Summit',
    category: 'Tech',
    date: '2026-10-08',
    time: '10:00',
    venue: 'Innovation Hall',
    description: 'Explore AI-driven ideas, projects, and startup pitches through keynote sessions and live demos.',
    featured: true
  },
  {
    id: 'evt-2',
    name: 'Cultural Night 2026',
    category: 'Cultural',
    date: '2026-10-20',
    time: '18:30',
    venue: 'Main Auditorium',
    description: 'Celebrate dance, music, and art with a fun-filled campus showcase of talent and creativity.',
    featured: false
  },
  {
    id: 'evt-3',
    name: 'Design Thinking Bootcamp',
    category: 'Workshop',
    date: '2026-10-15',
    time: '13:00',
    venue: 'Creative Studio',
    description: 'A hands-on workshop to help students solve real problems using human-centered design methods.',
    featured: false
  },
  {
    id: 'evt-4',
    name: 'Inter-College Sports Fest',
    category: 'Sports',
    date: '2026-11-02',
    time: '08:30',
    venue: 'Campus Sports Ground',
    description: 'Compete, cheer, and connect across teams in football, basketball, athletics, and more.',
    featured: false
  },
  {
    id: 'evt-5',
    name: 'Startup Connect Mixer',
    category: 'Social',
    date: '2026-11-08',
    time: '17:00',
    venue: 'Conference Lounge',
    description: 'Meet founders, student entrepreneurs, and mentors for networking and collaboration.',
    featured: false
  }
];

const defaultRegistrations = [
  {
    id: 'reg-1',
    eventId: 'evt-1',
    eventName: 'AI Innovation Summit',
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    college: 'Computer Science Department',
    year: '3rd Year',
    phone: '+91 98765 43210'
  },
  {
    id: 'reg-2',
    eventId: 'evt-4',
    eventName: 'Inter-College Sports Fest',
    name: 'Meera Iyer',
    email: 'meera@example.com',
    college: 'School of Business',
    year: '2nd Year',
    phone: '+91 91234 56789'
  }
];

const eventSearchInput = document.getElementById('event-search');
const categoryFilterSelect = document.getElementById('category-filter');
const eventList = document.getElementById('events-list');
const featuredEventPanel = document.getElementById('featured-event-panel');
const registrationForm = document.getElementById('registration-form');
const modal = document.getElementById('registration-modal');
const selectedEventIdInput = document.getElementById('selected-event-id');
const eventForm = document.getElementById('event-form');
const adminEventsList = document.getElementById('admin-events-list');
const registrationSearchInput = document.getElementById('registration-search');
const registrationsList = document.getElementById('registrations-list');
const eventFormTitle = document.getElementById('event-form-title');
const cancelEditButton = document.getElementById('cancel-edit');
const toast = document.getElementById('toast');

let currentSelectedEventId = null;
let editingEventId = null;

function getStoredData(key, fallback) {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return fallback;

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Invalid JSON in ${key}:`, error);
    return fallback;
  }
}

function setStoredData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadEvents() {
  return getStoredData(STORAGE_KEYS.events, defaultEvents);
}

function loadRegistrations() {
  return getStoredData(STORAGE_KEYS.registrations, defaultRegistrations);
}

function saveEvents(events) {
  setStoredData(STORAGE_KEYS.events, events);
}

function saveRegistrations(registrations) {
  setStoredData(STORAGE_KEYS.registrations, registrations);
}

function getFeaturedEvent(events) {
  return events.find((event) => event.featured) || events[0] || null;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function formatTime(timeString) {
  const [hour, minute] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function renderFeaturedEvent() {
  const events = loadEvents();
  const featured = getFeaturedEvent(events);

  if (!featured) {
    featuredEventPanel.innerHTML = '<div class="empty-state">No featured event available.</div>';
    return;
  }

  featuredEventPanel.innerHTML = `
    <div class="featured-content">
      <div>
        <span class="featured-tag">Featured Event</span>
        <h3>${featured.name}</h3>
        <div class="featured-meta">
          <span>${featured.category}</span>
          <span>•</span>
          <span>${formatDate(featured.date)}</span>
          <span>•</span>
          <span>${featured.venue}</span>
        </div>
        <p class="featured-description">${featured.description}</p>
      </div>
      <div>
        <div class="featured-actions">
          <button class="primary-btn" data-event-id="${featured.id}" data-action="register">Register Now</button>
          <button class="secondary-btn" data-event-id="${featured.id}" data-action="view-events">View All</button>
        </div>
      </div>
    </div>
  `;

  const registerButton = featuredEventPanel.querySelector('[data-action="register"]');
  const viewEventsButton = featuredEventPanel.querySelector('[data-action="view-events"]');

  registerButton.addEventListener('click', () => openRegistrationModal(featured.id));
  viewEventsButton.addEventListener('click', () => document.getElementById('events').scrollIntoView({ behavior: 'smooth' }));
}

function renderEvents() {
  const events = loadEvents();
  const query = eventSearchInput.value.trim().toLowerCase();
  const category = categoryFilterSelect.value;

  let filteredEvents = events.filter((event) => {
    const matchesQuery = event.name.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || event.category === category;
    return matchesQuery && matchesCategory;
  });

  if (!filteredEvents.length) {
    eventList.innerHTML = '<div class="empty-state">No events match your current search or filter.</div>';
    return;
  }

  eventList.innerHTML = filteredEvents
    .map(
      (event) => `
        <article class="event-card">
          <div class="event-card-top">
            <span class="tag-chip">${event.category}</span>
            ${event.featured ? '<span class="tag-chip accent">Featured</span>' : ''}
          </div>
          <h3>${event.name}</h3>
          <div class="event-meta">
            <span>📅 ${formatDate(event.date)}</span>
            <span>🕒 ${formatTime(event.time)}</span>
            <span>📍 ${event.venue}</span>
          </div>
          <p class="event-description">${event.description}</p>
          <div class="event-footer">
            <span class="mini-text">Open for registration</span>
            <button class="action-btn" data-event-id="${event.id}" data-action="register">Register</button>
          </div>
        </article>
      `
    )
    .join('');

  eventList.querySelectorAll('[data-action="register"]').forEach((button) => {
    button.addEventListener('click', () => openRegistrationModal(button.dataset.eventId));
  });
}

function openRegistrationModal(eventId) {
  currentSelectedEventId = eventId;
  selectedEventIdInput.value = eventId;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeRegistrationModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  registrationForm.reset();
  selectedEventIdInput.value = '';
  currentSelectedEventId = null;
}

function renderAdminEvents() {
  const events = loadEvents();

  if (!events.length) {
    adminEventsList.innerHTML = '<div class="empty-state">No events yet. Add the first club event.</div>';
    return;
  }

  adminEventsList.innerHTML = events
    .map(
      (event) => `
        <div class="list-item">
          <div>
            <h4>${event.name}</h4>
            <div class="list-meta">
              <div>${event.category} • ${formatDate(event.date)}</div>
              <div>${formatTime(event.time)} • ${event.venue}</div>
            </div>
          </div>
          <div class="list-actions">
            <button class="list-action-btn" data-action="edit-event" data-event-id="${event.id}">Edit</button>
            <button class="list-action-btn delete" data-action="delete-event" data-event-id="${event.id}">Delete</button>
          </div>
        </div>
      `
    )
    .join('');

  adminEventsList.querySelectorAll('[data-action="edit-event"]').forEach((button) => {
    button.addEventListener('click', () => prepareEventEdit(button.dataset.eventId));
  });

  adminEventsList.querySelectorAll('[data-action="delete-event"]').forEach((button) => {
    button.addEventListener('click', () => deleteEvent(button.dataset.eventId));
  });
}

function renderRegistrations() {
  const registrations = loadRegistrations();
  const query = registrationSearchInput.value.trim().toLowerCase();

  const filteredRegistrations = registrations.filter((entry) => {
    const searchable = `${entry.name} ${entry.email} ${entry.college} ${entry.eventName}`.toLowerCase();
    return searchable.includes(query);
  });

  if (!filteredRegistrations.length) {
    registrationsList.innerHTML = '<div class="empty-state">No registrations found.</div>';
    return;
  }

  registrationsList.innerHTML = filteredRegistrations
    .map(
      (entry) => `
        <div class="registration-row">
          <div>
            <strong>${entry.name}</strong>
            <span>${entry.email}</span>
          </div>
          <div>
            <strong>${entry.eventName}</strong>
            <span>${entry.college}</span>
          </div>
          <div>
            <strong>${entry.year}</strong>
            <span>${entry.phone}</span>
          </div>
          <div class="list-actions">
            <button class="list-action-btn delete" data-action="delete-registration" data-registration-id="${entry.id}">Delete</button>
          </div>
        </div>
      `
    )
    .join('');

  registrationsList.querySelectorAll('[data-action="delete-registration"]').forEach((button) => {
    button.addEventListener('click', () => deleteRegistration(button.dataset.registrationId));
  });
}

function prepareEventEdit(eventId) {
  const events = loadEvents();
  const eventToEdit = events.find((event) => event.id === eventId);

  if (!eventToEdit) return;

  editingEventId = eventId;
  eventFormTitle.textContent = 'Edit Event';
  document.getElementById('event-id').value = eventToEdit.id;
  document.getElementById('event-name').value = eventToEdit.name;
  document.getElementById('event-category').value = eventToEdit.category;
  document.getElementById('event-date').value = eventToEdit.date;
  document.getElementById('event-time').value = eventToEdit.time;
  document.getElementById('event-venue').value = eventToEdit.venue;
  document.getElementById('event-description').value = eventToEdit.description;
  document.getElementById('event-featured').checked = Boolean(eventToEdit.featured);

  document.getElementById('admin').scrollIntoView({ behavior: 'smooth' });
}

function resetEventForm() {
  editingEventId = null;
  eventForm.reset();
  document.getElementById('event-id').value = '';
  eventFormTitle.textContent = 'Add New Event';
}

function saveEvent(event) {
  const events = loadEvents();

  if (editingEventId) {
    const index = events.findIndex((item) => item.id === editingEventId);
    if (index !== -1) {
      events[index] = { ...events[index], ...event };
      saveEvents(events);
      showToast('Event updated successfully.');
    }
  } else {
    events.push({ ...event, id: `evt-${Date.now()}` });
    saveEvents(events);
    showToast('Event added successfully.');
  }

  resetEventForm();
  renderFeaturedEvent();
  renderEvents();
  renderAdminEvents();
}

function deleteEvent(eventId) {
  const events = loadEvents();
  const filteredEvents = events.filter((event) => event.id !== eventId);
  saveEvents(filteredEvents);

  const registrations = loadRegistrations();
  const filteredRegistrations = registrations.filter((entry) => entry.eventId !== eventId);
  saveRegistrations(filteredRegistrations);

  if (editingEventId === eventId) {
    resetEventForm();
  }

  renderFeaturedEvent();
  renderEvents();
  renderAdminEvents();
  renderRegistrations();
  showToast('Event deleted.');
}

function deleteRegistration(registrationId) {
  const registrations = loadRegistrations().filter((entry) => entry.id !== registrationId);
  saveRegistrations(registrations);
  renderRegistrations();
  showToast('Registration deleted.');
}

registrationForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const eventId = selectedEventIdInput.value;
  if (!eventId) {
    showToast('Please select an event first.');
    return;
  }

  const event = loadEvents().find((item) => item.id === eventId);
  if (!event) {
    showToast('Invalid event selection.');
    return;
  }

  const registrationData = {
    id: `reg-${Date.now()}`,
    eventId: event.id,
    eventName: event.name,
    name: document.getElementById('student-name').value.trim(),
    email: document.getElementById('student-email').value.trim(),
    college: document.getElementById('student-college').value.trim(),
    year: document.getElementById('student-year').value,
    phone: document.getElementById('student-phone').value.trim()
  };

  const registrations = loadRegistrations();
  registrations.push(registrationData);
  saveRegistrations(registrations);

  closeRegistrationModal();
  renderRegistrations();
  showToast(`Registered for ${event.name}!`);
});

eventForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const eventData = {
    name: document.getElementById('event-name').value.trim(),
    category: document.getElementById('event-category').value,
    date: document.getElementById('event-date').value,
    time: document.getElementById('event-time').value,
    venue: document.getElementById('event-venue').value.trim(),
    description: document.getElementById('event-description').value.trim(),
    featured: document.getElementById('event-featured').checked
  };

  if (!eventData.name || !eventData.date || !eventData.time || !eventData.venue || !eventData.description) {
    showToast('Please complete all required event details.');
    return;
  }

  if (eventData.featured) {
    const events = loadEvents();
    events.forEach((item) => {
      if (item.id !== editingEventId) item.featured = false;
    });
    saveEvents(events);
  }

  saveEvent(eventData);
});

cancelEditButton.addEventListener('click', resetEventForm);

document.querySelector('[data-close-modal="true"]').addEventListener('click', closeRegistrationModal);

document.querySelectorAll('[data-close-modal="true"]').forEach((button) => {
  button.addEventListener('click', closeRegistrationModal);
});

document.getElementById('show-admin').addEventListener('click', () => {
  document.getElementById('admin').scrollIntoView({ behavior: 'smooth' });
});

if (eventSearchInput) {
  eventSearchInput.addEventListener('input', renderEvents);
}

if (categoryFilterSelect) {
  categoryFilterSelect.addEventListener('change', renderEvents);
}

if (registrationSearchInput) {
  registrationSearchInput.addEventListener('input', renderRegistrations);
}

function bootstrap() {
  const events = loadEvents();
  const registrations = loadRegistrations();

  if (!events.length) {
    saveEvents(defaultEvents);
  }

  if (!registrations.length) {
    saveRegistrations(defaultRegistrations);
  }

  renderFeaturedEvent();
  renderEvents();
  renderAdminEvents();
  renderRegistrations();
}

bootstrap();
