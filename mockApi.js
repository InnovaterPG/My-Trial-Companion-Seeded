// Client-side mock backend for the My Trial Companion app.
// Intercepts /api/* fetches and serves seeded dummy data from localStorage.

const todayISO = () => new Date().toISOString().split('T')[0];
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const DEMO_USER = {
  id: 'a1000000-0000-0000-0000-000000000001',
  participantId: 'PT-2024-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  trialId: 'TRIAL-001',
  trialName: 'Phase 3 Clinical Study',
  role: 'participant',
  points: 150,
  streak: 7,
};

const DOCTOR_USER = {
  id: 'a2000000-0000-0000-0000-000000000001',
  participantId: 'DR-2024-001',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@clinic.com',
  trialId: 'TRIAL-001',
  trialName: 'Phase 3 Clinical Study',
  role: 'doctor',
  points: 0,
  streak: 0,
};

const USERS = {
  'PT-2024-001': DEMO_USER,
  'DR-2024-001': DOCTOR_USER,
};

const DOCTORS = [
  { id: 'd1000000-0000-0000-0000-000000000001', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@clinic.com', specialty: 'Principal Investigator', available: true },
  { id: 'd1000000-0000-0000-0000-000000000002', name: 'Dr. Michael Chen', email: 'michael.chen@clinic.com', specialty: 'Study Physician', available: true },
];

function seedAppointments() {
  const u = DEMO_USER.id;
  return [
    { id: 'apt-1', user_id: u, doctor_id: DOCTORS[0].id, doctor_name: 'Dr. Sarah Johnson', doctor_specialty: 'Principal Investigator', patient_name: 'John Doe', title: 'Visit 1 SCR (Screening)', appointment_date: addDays(-30), appointment_time: '10:00:00', visit_type: 'in-person', location: 'Clinic Room 201', status: 'completed', amount_inr: 5793 },
    { id: 'apt-2', user_id: u, doctor_id: DOCTORS[0].id, doctor_name: 'Dr. Sarah Johnson', doctor_specialty: 'Principal Investigator', patient_name: 'John Doe', title: 'Visit 2 RND/M0 (Randomization)', appointment_date: addDays(-23), appointment_time: '10:00:00', visit_type: 'in-person', location: 'Clinic Room 201', status: 'completed', amount_inr: 9476 },
    { id: 'apt-3', user_id: u, doctor_id: DOCTORS[1].id, doctor_name: 'Dr. Michael Chen', doctor_specialty: 'Study Physician', patient_name: 'John Doe', title: 'Day 7/Hospital Discharge', appointment_date: addDays(-16), appointment_time: '09:00:00', visit_type: 'in-person', location: 'Hospital Ward B', status: 'completed', amount_inr: 3117 },
    { id: 'apt-4', user_id: u, doctor_id: DOCTORS[0].id, doctor_name: 'Dr. Sarah Johnson', doctor_specialty: 'Principal Investigator', patient_name: 'John Doe', title: 'Visit 3/M1', appointment_date: addDays(1), appointment_time: '14:00:00', visit_type: 'remote', location: 'Phone Call', status: 'confirmed', amount_inr: 2508 },
    { id: 'apt-5', user_id: u, doctor_id: DOCTORS[0].id, doctor_name: 'Dr. Sarah Johnson', doctor_specialty: 'Principal Investigator', patient_name: 'John Doe', title: 'Visit 4/M3', appointment_date: addDays(60), appointment_time: '10:00:00', visit_type: 'in-person', location: 'Clinic Room 201', status: 'pending', amount_inr: 3879 },
    { id: 'apt-6', user_id: u, doctor_id: DOCTORS[1].id, doctor_name: 'Dr. Michael Chen', doctor_specialty: 'Study Physician', patient_name: 'John Doe', title: 'Visit 5/M6', appointment_date: addDays(150), appointment_time: '10:00:00', visit_type: 'in-person', location: 'Clinic Room 201', status: 'pending', amount_inr: 3547 },
  ];
}

const DB_KEY = 'trial_mock_db_v1';
function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  const db = { appointments: seedAppointments() };
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}
function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

const SCHEDULE = [
  { schedule_id: 'c1', medication_id: 'b1', name: 'Rivaroxaban', dosage: '20mg', instructions: 'Take once daily WITH FOOD. Do not crush tablets.', scheduled_time: '08:00:00', photo_required: true, taken: false, taken_at: null },
];

function buildHistory() {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    days.push({ date: addDays(-i), scheduled_count: 1, taken_count: i === 0 ? 0 : 1, status: i === 0 ? 'pending' : 'complete' });
  }
  return days;
}

const QUIZ = {
  id: 'q1',
  question: 'Why is it important to take medication at the same time each day?',
  options: ['It tastes better', 'To maintain consistent drug levels in your body', 'To save time', 'No reason'],
  correctAnswer: 1,
  explanation: 'Maintaining consistent drug levels helps ensure the medication works effectively.',
  points: 15,
};

const VIDEOS = [
  { id: 'v1', title: 'Understanding Your Trial Medication', description: 'Learn about how your medication works.', doctor_name: 'Dr. Sarah Johnson', duration: '5:32', type: 'educational', points: 10, watched: true },
  { id: 'v2', title: 'Tips for Managing Side Effects', description: 'Practical advice for dealing with side effects.', doctor_name: 'Dr. Michael Chen', duration: '4:15', type: 'tips', points: 10, watched: false },
  { id: 'v3', title: 'You Are Making a Difference', description: 'A message of appreciation from the study team.', doctor_name: 'Study Team', duration: '2:45', type: 'motivation', points: 5, watched: false },
];

const CHALLENGES = [
  { id: 'ch1', title: 'Watch a video', description: 'Watch any educational video today', type: 'daily', points: 10, completed: true },
  { id: 'ch2', title: 'Take your medication', description: 'Log all your medications for today', type: 'daily', points: 20, completed: false },
  { id: 'ch3', title: 'Answer the daily quiz', description: 'Complete todays knowledge quiz', type: 'daily', points: 15, completed: false },
  { id: 'ch4', title: 'Read health tip of the day', description: 'Read and acknowledge todays health tip', type: 'daily', points: 5, completed: false },
];

const BADGES = [
  { id: 'bd1', name: 'First Steps', description: 'Complete your first challenge', icon: '👣', points_awarded: 10, earned: true, earned_at: addDays(-20) },
  { id: 'bd2', name: 'Streak Starter', description: 'Maintain a 3-day streak', icon: '🔥', points_awarded: 25, earned: true, earned_at: addDays(-10) },
  { id: 'bd3', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚔️', points_awarded: 50, earned: true, earned_at: addDays(-3) },
  { id: 'bd4', name: 'Video Scholar', description: 'Watch 5 educational videos', icon: '🎓', points_awarded: 30, earned: true, earned_at: addDays(-5) },
  { id: 'bd5', name: 'Quiz Master', description: 'Answer 10 quiz questions correctly', icon: '🧠', points_awarded: 40, earned: false },
  { id: 'bd6', name: 'Point Hunter', description: 'Earn 100 points', icon: '💯', points_awarded: 20, earned: true, earned_at: addDays(-7) },
  { id: 'bd7', name: 'Rising Star', description: 'Earn 500 points', icon: '⭐', points_awarded: 50, earned: false },
  { id: 'bd8', name: 'Champion', description: 'Earn 1000 points', icon: '🏆', points_awarded: 100, earned: false },
  { id: 'bd9', name: 'Dedicated', description: 'Complete 20 challenges', icon: '💪', points_awarded: 60, earned: false },
  { id: 'bd10', name: 'Two Week Streak', description: 'Maintain a 14-day streak', icon: '🌟', points_awarded: 100, earned: false },
];

const TIPS = [
  { id: 't1', title: 'Stay Hydrated', content: 'Drinking enough water is essential for your body to function properly. Aim for 8 glasses a day!', category: 'wellness', points: 5, read: false },
  { id: 't2', title: 'Track Your Symptoms', content: 'Keeping a daily log of how you feel can help your medical team provide better care.', category: 'trial', points: 5, read: true },
  { id: 't3', title: 'Rest Well', content: 'Quality sleep helps your body heal and process medications more effectively.', category: 'wellness', points: 5, read: false },
];

const LEADERBOARD = [
  { rank: 1, nickname: 'Trial Hero', avatar: '🏆', points: 220, isCurrentUser: false },
  { rank: 2, nickname: 'Shining Star', avatar: '⭐', points: 150, isCurrentUser: true },
  { rank: 3, nickname: 'Rising Champion', avatar: '🌟', points: 85, isCurrentUser: false },
];

const FAQ_ANSWERS = [
  { k: ['side effect', 'side-effect'], a: 'Common side effects may include mild nausea or fatigue. If you experience anything unusual or severe, please contact your study coordinator immediately.' },
  { k: ['miss', 'dose'], a: 'If you miss a dose, do not double up. Take it as soon as you remember on the same day, and contact your study coordinator for guidance.' },
  { k: ['travel'], a: 'Travel during the study is usually possible, but please discuss timing with your study team so it does not conflict with scheduled visits.' },
  { k: ['how long', 'last', 'duration'], a: 'This Phase 3 study runs for approximately 30 months, including the treatment period and a safety follow-up.' },
];

function chatReply(message) {
  const m = (message || '').toLowerCase();
  for (const item of FAQ_ANSWERS) {
    if (item.k.some((k) => m.includes(k))) return item.a;
  }
  return "Thanks for your question! For anything specific about your trial, your study coordinator is the best resource. I can help with general guidance on medication, appointments, and engagement.";
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

async function handle(url, opts) {
  const u = new URL(url, 'http://local');
  const path = u.pathname.replace(/^\/api/, '');
  const q = u.searchParams;
  const method = (opts?.method || 'GET').toUpperCase();
  let body = {};
  try { body = opts?.body ? JSON.parse(opts.body) : {}; } catch (_) { /* */ }
  const db = loadDB();

  // ---- AUTH ----
  if (path === '/auth/login' && method === 'POST') {
    const user = USERS[body.participantId];
    if (user) return json({ user });
    return json({ error: 'Invalid credentials. Try the demo account.' }, 401);
  }

  // ---- APPOINTMENTS ----
  if (path === '/appointments/doctors/list') return json(DOCTORS);
  if (path === '/appointments/upcoming') {
    const list = db.appointments.filter((a) => a.appointment_date >= todayISO() && ['confirmed', 'pending'].includes(a.status));
    return json(list);
  }
  if (path === '/appointments/doctor-by-user/' + (DOCTOR_USER.id)) return json({ doctorId: DOCTORS[0].id });
  if (path.startsWith('/appointments/doctor-by-user/')) return json({ doctorId: DOCTORS[0].id });
  if (path.startsWith('/appointments/doctors/') && path.endsWith('/slots')) {
    return json({ availableSlots: ['09:00', '09:30', '10:00', '11:00', '13:30', '14:00', '15:00', '16:00'] });
  }
  if (path.startsWith('/appointments/doctor/')) {
    const status = q.get('status') || 'all';
    let list = db.appointments;
    if (status !== 'all') list = list.filter((a) => a.status === status);
    return json(list);
  }
  if (path === '/appointments' && method === 'GET') {
    return json(db.appointments);
  }
  if (path === '/appointments' && method === 'POST') {
    const doc = DOCTORS.find((d) => d.id === body.doctorId) || DOCTORS[0];
    const apt = {
      id: 'apt-' + Date.now(), user_id: body.userId, doctor_id: body.doctorId, doctor_name: doc.name,
      doctor_specialty: doc.specialty, patient_name: 'John Doe', title: 'Requested Consultation',
      appointment_date: body.date, appointment_time: body.time, visit_type: body.type,
      location: body.type === 'remote' ? 'Video Call' : 'Clinic', reason: body.reason, status: 'pending', amount_inr: 0,
    };
    db.appointments.push(apt); saveDB(db);
    return json(apt, 201);
  }
  const aptAction = path.match(/^\/appointments\/([^/]+)\/(confirm|decline|complete|status)$/);
  if (aptAction) {
    const apt = db.appointments.find((a) => a.id === aptAction[1]);
    if (apt) {
      const map = { confirm: 'confirmed', decline: 'declined', complete: 'completed' };
      apt.status = aptAction[2] === 'status' ? (body.status || apt.status) : map[aptAction[2]];
      saveDB(db);
    }
    return json(apt || { error: 'Not found' }, apt ? 200 : 404);
  }
  const aptDelete = path.match(/^\/appointments\/([^/]+)$/);
  if (aptDelete && method === 'DELETE') {
    db.appointments = db.appointments.filter((a) => a.id !== aptDelete[1]); saveDB(db);
    return json({ message: 'Appointment cancelled' });
  }

  // ---- MEDICATIONS ----
  if (path === '/medications/schedule') return json(SCHEDULE);
  if (path === '/medications/history') return json(buildHistory());
  if (path === '/medications/stats') {
    return json({ adherenceRate: 93, currentStreak: 7, bestStreak: 12, totalTaken: 13, totalScheduled: 14, dailyScheduled: 1, daysWithLogs: 13 });
  }
  if (path === '/medications/reminders') return json({ enabled: true });
  if (path === '/medications/reminders/toggle') return json({ enabled: body.enabled });
  if (path === '/medications/patients') return json([{ ...DEMO_USER }]);
  if (path === '/medications/log') return json({ message: 'Medication logged! +10 points', bonusAwarded: true });

  // ---- ENGAGEMENT ----
  if (path === '/engagement/stats') {
    return json({ points: 150, streak: 7, badgesEarned: 5, rank: 2, nickname: 'Shining Star', avatar: '⭐', videosWatched: 5, challengesCompleted: 12 });
  }
  if (path === '/engagement/leaderboard') return json({ leaderboard: LEADERBOARD });
  if (path === '/engagement/videos') return json(VIDEOS);
  if (path === '/engagement/challenges') return json(CHALLENGES);
  if (path === '/engagement/badges') return json(BADGES);
  if (path === '/engagement/badges/check') return json({ newBadges: [] });
  if (path === '/engagement/quizzes' && method === 'GET') return json({ quiz: QUIZ, completed: false });
  if (path.match(/^\/engagement\/quizzes\/.+\/answer$/)) {
    const correct = body.answer === QUIZ.correctAnswer;
    return json({ correct, correctAnswer: QUIZ.correctAnswer, explanation: QUIZ.explanation, pointsEarned: correct ? QUIZ.points : 0 });
  }
  if (path === '/engagement/tips') return json(TIPS);
  if (path.match(/^\/engagement\/tips\/.+\/read$/)) return json({ pointsAwarded: 5 });
  if (path.match(/^\/engagement\/videos\/.+\/watch$/)) return json({ pointsAwarded: 10 });
  if (path.match(/^\/engagement\/challenges\/.+\/complete$/)) return json({ pointsAwarded: 20, message: 'Challenge complete!' });
  if (path === '/engagement/streak') return json({ pointsAwarded: 5, message: '🔥 Streak extended! +5 points' });
  if (path === '/engagement/profile') return json({ ok: true });

  // ---- REPORTS ----
  if (path === '/reports/overview') {
    return json({
      user: { trialName: 'Phase 3 Clinical Study', trialPhase: 'Phase 3', daysInTrial: 30 },
      engagement: { points: 150, streak: 7, badgesEarned: 5, challengesCompleted: 12, videosWatched: 5, quizzesCompleted: 8 },
      appointments: { total: 6, completed: 3, upcoming: 2, missed: 0, completionRate: 100, videoVisits: 1, inPersonVisits: 5 },
      medication: { adherenceRate: 93, totalTaken: 13 },
      videoCalls: { completed: 1, avgDuration: 18 },
    });
  }
  if (path === '/reports/appointments') {
    const upcoming = db.appointments.filter((a) => a.appointment_date >= todayISO()).map((a) => ({ ...a, type: a.visit_type === 'remote' ? 'video' : 'in-person', specialty: a.doctor_specialty }));
    return json({
      stats: { total: 6, completed: 3, missed: 0, upcoming: upcoming.length, completionRate: 100 },
      upcoming,
      byType: [{ type: 'in-person', count: 5, completed: 3 }, { type: 'video', count: 1, completed: 0 }],
      appointments: db.appointments.map((a) => ({ ...a, type: a.visit_type })),
    });
  }
  if (path === '/reports/medication') {
    const dailyAdherence = buildHistory().map((d) => ({ label: d.date.slice(5), adherence_percent: d.taken_count >= d.scheduled_count ? 100 : 0 }));
    return json({
      stats: { adherenceRate: 93, totalTaken: 13, totalExpected: 14, currentStreak: 7, photoRate: 85 },
      photoCompliance: { with_photo: 11 },
      dailyAdherence,
      perMedicationAdherence: [{ name: 'Rivaroxaban 20mg', times_taken: 13, expected_doses: 14, adherence_rate: 93 }],
      timeAnalysis: [{ time_of_day: 'Morning', count: 13 }, { time_of_day: 'Afternoon', count: 0 }, { time_of_day: 'Evening', count: 0 }],
    });
  }
  if (path === '/reports/engagement') {
    return json({
      stats: { totalPoints: 150, currentStreak: 7 },
      earnedBadges: 5, totalBadges: 10,
      leaderboard: { rank: 2, total: 3 },
      pointsBreakdown: { medication_points: 60, appointment_points: 30, quiz_points: 20, tips_points: 10, challenge_points: 20, video_points: 10 },
      badges: BADGES.map((b) => ({ ...b, earned_at: b.earned ? b.earned_at : null })),
      activityTimeline: [
        { type: 'medication', action: 'Logged morning medication', timestamp: new Date().toISOString() },
        { type: 'quiz', action: 'Answered daily quiz correctly', timestamp: addDays(-1) + 'T09:00:00' },
        { type: 'badge', action: 'Earned Week Warrior badge', timestamp: addDays(-3) + 'T12:00:00' },
      ],
    });
  }
  if (path === '/reports/export') {
    if (q.get('format') === 'csv') {
      return new Response('section,metric,value\noverview,points,150\noverview,streak,7\n', { headers: { 'Content-Type': 'text/csv' } });
    }
    return json({ exportedAt: new Date().toISOString(), points: 150, streak: 7 });
  }

  // ---- CHAT ----
  if (path === '/chat' && method === 'POST') return json({ response: chatReply(body.message), source: 'faq' });
  if (path === '/chat/suggestions') {
    return json([
      { text: 'What are the side effects of my medication?', icon: '💊' },
      { text: 'How long will the trial last?', icon: '📅' },
      { text: 'Can I travel during the study?', icon: '✈️' },
      { text: 'What happens if I miss a dose?', icon: '⏰' },
    ]);
  }
  if (path.startsWith('/chat/history')) return json([]);

  // ---- VIDEO ----
  if (path === '/video/call/incoming/' || path.startsWith('/video/call/incoming/')) return json(null);
  if (path === '/video/consultations' && method === 'GET') return json([]);
  if (path === '/video/quick-start') {
    return json({ token: 'demo-token', url: 'wss://demo', roomName: 'trial-room-' + Date.now(), consultationId: 'c-' + Date.now() });
  }
  if (path.match(/^\/video\/consultations\/.+\/join$/)) {
    return json({ token: 'demo-token', url: 'wss://demo', roomName: 'trial-room', consultation: { doctor_name: 'Dr. Sarah Johnson' } });
  }
  if (path === '/video/call/initiate') {
    return json({ token: 'demo-token', url: 'wss://demo', roomName: 'trial-room', consultationId: 'c-' + Date.now() });
  }
  if (path.startsWith('/video/consultations/')) return json({ room_name: 'trial-room', doctor_name: 'Dr. Sarah Johnson' });

  // ---- NOTIFICATIONS ----
  if (path.startsWith('/notifications/history/')) return json([]);
  if (path.startsWith('/notifications/unread-count/')) return json({ count: 0 });
  if (path.startsWith('/notifications/preferences/')) {
    return json({ push_enabled: false, email_enabled: true, telegram_enabled: false, reminder_24h: true, reminder_2h: true, reminder_30min: false, medication_reminders: true, engagement_reminders: true });
  }

  return json({ ok: true });
}

let installed = false;
export function installMockApi() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = (input, opts) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (url && url.includes('/api/')) {
      return handle(url, opts).catch(() => new Response('{}', { status: 500 }));
    }
    return original(input, opts);
  };
}
