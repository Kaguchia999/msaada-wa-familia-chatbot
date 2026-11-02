const chatArea = document.getElementById('chatArea');
const logArea = document.getElementById('logArea');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const viewLogsButton = document.getElementById('viewLogsButton');
const languageToggle = document.getElementById('languageToggle');
const headerSubtitle = document.getElementById('headerSubtitle');
const logTitle = document.getElementById('logTitle');

let language = 'en';
let conversation = [];
let state = 'greeting';
let logDraft = {
  childName: '',
  seizureDate: '',
  seizureTime: '',
  duration: '',
  description: '',
  location: '',
  medicationTaken: 'No',
  medicationType: '',
  medicationTime: '',
  notes: ''
};

const translations = {
  en: {
    greeting: "Hello! I'm here to help you record your child's seizure details. What is your child's name?",
    seizureDate: 'When did the seizure happen? (e.g., 2026-06-06)',
    seizureTime: 'What time did it start? (e.g., 08:30)',
    duration: 'How long did it last? (e.g., 2 minutes)',
    description: 'Please describe what happened. Include any symptoms or signs.',
    location: 'Where was your child when it happened?',
    medicationAsked: 'Was medication given? (Yes/No)',
    medicationType: 'What medication was given?',
    medicationTime: 'When was the medication given? (e.g., 08:35)',
    notes: 'Any other notes? (optional - just press Send to skip)',
    complete: 'Thank you! I have saved the seizure log. Type "new" to log another or "view logs" to see all records.',
    headerSubtitle: 'For Kenyan parents supporting children with epilepsy and disabilities.',
    logTitle: 'Seizure Log',
    refreshButton: 'Refresh Logs',
    sendButton: 'Send',
    newLog: "Okay, let's record a new seizure.",
    noLogs: 'No seizure logs have been recorded yet.',
    savingError: 'Sorry, something went wrong. Please try again.',
    instructions: 'Type "new" to log a seizure or "view logs" to see all records.'
  },
  sw: {
    greeting: "Habari! Niko hapa kukukusaidia kuandika maelezo ya matatizo ya kizunguzungu ya mtoto wako. Jina la mtoto wako ni nani?",
    seizureDate: 'Kizunguzungu kilitokea lini? (mfano, 2026-06-06)',
    seizureTime: 'Ilianza saa ngapi? (mfano, 08:30)',
    duration: 'Ilidumu kwa muda gani? (mfano, dakika 2)',
    description: 'Tafadhali eleza kile kilitokea. Jumuisha dalili zozote.',
    location: 'Mtoto wako alikuwa wapi liliposemi kizunguzungu?',
    medicationAsked: 'Je, dawa ilipewa? (Ndiyo/Hapana)',
    medicationType: 'Ni dawa gani iliyopewa?',
    medicationTime: 'Dawa ilipewa saa ngapi? (mfano, 08:35)',
    notes: 'Maelezo mengine yoyote? (kwa hiari - bonyeza tu Tuma ili kuruka)',
    complete: 'Asante! Nimehifadhi rekodi ya kizunguzungu. Andika "new" kuandika kingine au "view logs" kuona rekodi zote.',
    headerSubtitle: 'Kwa wazazi wa Kenya wanayokamatia watoto wenye kizunguzungu na ulemavu.',
    logTitle: 'Rekodi ya Kizunguzungu',
    refreshButton: 'Onyesha Tena',
    sendButton: 'Tuma',
    newLog: 'Sawa, wacha tuandike kizunguzungu kipya.',
    noLogs: 'Hakuna rekodi ya kizunguzungu iliyoandikwa bado.',
    savingError: 'Samahani, kitu kiliendeleana. Tafadhali jaribu tena.',
    instructions: 'Andika "new" kuandika kizunguzungu au "view logs" kuona rekodi zote.'
  }
};

function getTranslation(key) {
  return translations[language][key] || translations.en[key];
}

function updateUIText() {
  headerSubtitle.textContent = getTranslation('headerSubtitle');
  logTitle.textContent = getTranslation('logTitle');
  viewLogsButton.textContent = getTranslation('refreshButton');
  sendButton.textContent = getTranslation('sendButton');
  userInput.placeholder = getTranslation('instructions');
}

function addMessage(text, sender) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${sender}`;
  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;
  wrapper.appendChild(content);
  chatArea.appendChild(wrapper);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function askNextQuestion() {
  if (state === 'childName') {
    addMessage(getTranslation('seizureDate'), 'bot');
    state = 'seizureDate';
  } else if (state === 'seizureDate') {
    addMessage(getTranslation('seizureTime'), 'bot');
    state = 'seizureTime';
  } else if (state === 'seizureTime') {
    addMessage(getTranslation('duration'), 'bot');
    state = 'duration';
  } else if (state === 'duration') {
    addMessage(getTranslation('description'), 'bot');
    state = 'description';
  } else if (state === 'description') {
    addMessage(getTranslation('location'), 'bot');
    state = 'location';
  } else if (state === 'location') {
    addMessage(getTranslation('medicationAsked'), 'bot');
    state = 'medicationAsked';
  } else if (state === 'medicationYes') {
    addMessage(getTranslation('medicationType'), 'bot');
    state = 'medicationType';
  } else if (state === 'medicationType') {
    addMessage(getTranslation('medicationTime'), 'bot');
    state = 'medicationTime';
  } else if (state === 'medicationTime') {
    addMessage(getTranslation('notes'), 'bot');
    state = 'notes';
  }
}

function saveLog() {
  fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logDraft)
  })
    .then((res) => res.json())
    .then(() => {
      addMessage(getTranslation('complete'), 'bot');
      resetDraft();
      state = 'completed';
      fetchLogs();
    })
    .catch(() => {
      addMessage(getTranslation('savingError'), 'bot');
    });
}

function resetDraft() {
  logDraft = {
    childName: '',
    seizureDate: '',
    seizureTime: '',
    duration: '',
    description: '',
    location: '',
    medicationTaken: 'No',
    medicationType: '',
    medicationTime: '',
    notes: ''
  };
}

function handleInput(text) {
  const normalized = text.trim().toLowerCase();

  if (normalized === 'view logs') {
    fetchLogs();
    return;
  }

  if (normalized === 'new') {
    state = 'childName';
    resetDraft();
    addMessage(getTranslation('newLog'), 'bot');
    askNextQuestion();
    return;
  }

  if (state === 'childName') {
    logDraft.childName = text;
    state = 'seizureDate';
    askNextQuestion();
    return;
  }

  if (state === 'seizureDate') {
    logDraft.seizureDate = text;
    state = 'seizureTime';
    askNextQuestion();
    return;
  }

  if (state === 'seizureTime') {
    logDraft.seizureTime = text;
    state = 'duration';
    askNextQuestion();
    return;
  }

  if (state === 'duration') {
    logDraft.duration = text;
    state = 'description';
    askNextQuestion();
    return;
  }

  if (state === 'description') {
    logDraft.description = text;
    state = 'location';
    askNextQuestion();
    return;
  }

  if (state === 'location') {
    logDraft.location = text;
    state = 'medicationAsked';
    askNextQuestion();
    return;
  }

  if (state === 'medicationAsked') {
    const med = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    if (med === 'Y' || normalized === 'yes' || normalized === 'ndiyo') {
      logDraft.medicationTaken = 'Yes';
      state = 'medicationYes';
      askNextQuestion();
    } else if (med === 'N' || normalized === 'no' || normalized === 'hapana') {
      logDraft.medicationTaken = 'No';
      state = 'notes';
      addMessage(getTranslation('notes'), 'bot');
    } else {
      addMessage('Please answer Yes or No.', 'bot');
    }
    return;
  }

  if (state === 'medicationType') {
    logDraft.medicationType = text;
    state = 'medicationTime';
    askNextQuestion();
    return;
  }

  if (state === 'medicationTime') {
    logDraft.medicationTime = text;
    state = 'notes';
    addMessage(getTranslation('notes'), 'bot');
    return;
  }

  if (state === 'notes') {
    logDraft.notes = text || 'None';
    saveLog();
    return;
  }

  addMessage(getTranslation('instructions'), 'bot');
}

function fetchLogs() {
  fetch('/api/logs')
    .then((res) => res.json())
    .then((logs) => {
      logArea.innerHTML = '';
      if (logs.length === 0) {
        logArea.textContent = getTranslation('noLogs');
        return;
      }
      logs.forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'log-entry';
        let medicationInfo = '';
        if (entry.medicationTaken === 'Yes') {
          medicationInfo = `
            <p><strong>${language === 'en' ? 'Medication:' : 'Dawa:'}</strong> ${entry.medicationType}</p>
            <p><strong>${language === 'en' ? 'Medication Time:' : 'Saa ya Dawa:'}</strong> ${entry.medicationTime}</p>
          `;
        }
        item.innerHTML = `
          <h3>${entry.childName} — ${entry.seizureDate} ${entry.seizureTime}</h3>
          <p><strong>${language === 'en' ? 'Duration:' : 'Muda:'}</strong> ${entry.duration}</p>
          <p><strong>${language === 'en' ? 'Location:' : 'Mahali:'}</strong> ${entry.location}</p>
          <p><strong>${language === 'en' ? 'Description:' : 'Maelezo:'}</strong> ${entry.description}</p>
          ${medicationInfo}
          <p><strong>${language === 'en' ? 'Notes:' : 'Maelezo Mengine:'}</strong> ${entry.notes}</p>
        `;
        logArea.appendChild(item);
      });
    })
    .catch(() => {
      logArea.textContent = language === 'en' ? 'Unable to load logs.' : 'Haiwezi kupakia rekodi.';
    });
}

languageToggle.addEventListener('click', () => {
  language = language === 'en' ? 'sw' : 'en';
  updateUIText();
  addMessage(
    language === 'en'
      ? 'Language changed to English'
      : 'Lugha imebadilishwa kuwa Swahili',
    'bot'
  );
});

sendButton.addEventListener('click', () => {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  userInput.value = '';
  handleInput(text);
});

userInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendButton.click();
  }
});

viewLogsButton.addEventListener('click', fetchLogs);

window.addEventListener('load', () => {
  updateUIText();
  addMessage(getTranslation('greeting'), 'bot');
  fetchLogs();
});
