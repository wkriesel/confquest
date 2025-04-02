// App state
const state = {
  username: null,
  day: null,
  avatar: null,
  xp: 0,
  quests: [],
  completedQuests: [],
  reflections: [],
  hasBonus: false,
  bonusQuest: null
};

// DOM elements
const elements = {
  login: document.getElementById('login'),
  setup: document.getElementById('setup'),
  quests: document.getElementById('quests'),
  reflections: document.getElementById('reflections'),
  username: document.getElementById('username'),
  dayButtons: document.querySelectorAll('.day-button'),
  loginButton: document.getElementById('login-button'),
  userInfo: document.getElementById('user-info'),
  displayUsername: document.getElementById('display-username'),
  displayDay: document.getElementById('display-day'),
  avatars: document.querySelectorAll('.avatar'),
  startButton: document.getElementById('start-button'),
  questList: document.getElementById('quest-list'),
  userAvatar: document.getElementById('user-avatar'),
  xpValue: document.getElementById('xp-value'),
  xpProgress: document.querySelector('.xp-progress'),
  reflectionForm: document.getElementById('reflection-form'),
  reflectionText: document.getElementById('reflection-text'),
  reflectionPhoto: document.getElementById('reflection-photo'),
  saveReflection: document.getElementById('save-reflection'),
  skipReflection: document.getElementById('skip-reflection'),
  reflectionList: document.getElementById('reflection-list'),
  toggleReflections: document.getElementById('toggle-reflections'),
  backToQuests: document.getElementById('back-to-quests'),
  dayNavigation: document.getElementById('day-navigation'),
  switchDay: document.getElementById('switch-day'),
  daySwitcher: document.getElementById('day-switcher'),
  daySwitchButtons: document.querySelectorAll('.day-switch-button'),
  cancelSwitch: document.getElementById('cancel-switch')
};

// Quest templates based on avatar type
const questTemplates = {
  learner: [
    "Attend a session in a topic totally new to you—take 3 notes & snap a pic.",
    "Find someone using an edtech tool you've never heard of and ask for a 1-minute demo.",
    "Identify three new trends mentioned in keynotes that you want to explore further."
  ],
  strategic: [
    "Re-route your schedule mid-day to follow a surprise idea or opportunity.",
    "Connect two speakers' ideas in a way that could solve a challenge at your institution.",
    "Sketch a quick implementation plan for one new tool or approach you discovered today."
  ],
  relator: [
    "Find someone wearing your school's color and ask what tech they use every day.",
    "Start a meal conversation about everyone's favorite classroom breakthrough moment.",
    "Connect two people you meet who should know each other based on common interests."
  ],
  discoverer: [
    "Collect 3 different conference swag items and brainstorm a creative classroom use for each.",
    "Visit the most interesting-looking vendor booth and ask about their newest feature.",
    "Take a different path through the venue and note something most attendees probably missed."
  ]
};

// Bonus quest templates
const bonusQuestTemplates = {
  day1: {
    learner: "BONUS: Find someone who has attended this conference before and ask for their #1 tip.",
    strategic: "BONUS: Find a quiet spot and map out your strategy for the rest of the conference.",
    relator: "BONUS: During lunch, introduce yourself to 3 new people and exchange contact info.",
    discoverer: "BONUS: Discover and share a hidden gem at the conference venue with someone new."
  },
  day2: {
    learner: "BONUS: Attend a session completely outside your professional focus area.",
    strategic: "BONUS: Find a presenter and ask how they prepared their session strategy.",
    relator: "BONUS: Follow up with someone you met yesterday with a thoughtful question.",
    discoverer: "BONUS: Try a food or beverage at the conference you've never tried before."
  },
  day3: {
    learner: "BONUS: List 3 specific actions you'll take when you return to work.",
    strategic: "BONUS: Sketch a 30-day implementation plan for your top conference insight.",
    relator: "BONUS: Connect with 2 people to continue conversations after the conference.",
    discoverer: "BONUS: Document your top 5 discoveries from the entire conference."
  }
};

// Initialize the app
function init() {
  // Set up login process
  elements.username.addEventListener('input', validateLoginForm);
  elements.dayButtons.forEach(button => {
    button.addEventListener('click', () => selectDay(button));
  });
  elements.loginButton.addEventListener('click', processLogin);
  
  // Set up avatar selection
  elements.avatars.forEach(avatar => {
    avatar.addEventListener('click', () => selectAvatar(avatar));
  });
  
  // Set up start button
  elements.startButton.addEventListener('click', startQuest);
  
  // Set up reflection navigation
  elements.toggleReflections.addEventListener('click', showReflections);
  elements.backToQuests.addEventListener('click', showQuests);
  
  // Set up reflection submission
  elements.saveReflection.addEventListener('click', saveReflection);
  elements.skipReflection.addEventListener('click', skipReflection);
  
  // Set up day switching
  elements.switchDay.addEventListener('click', showDaySwitcher);
  elements.daySwitchButtons.forEach(button => {
    button.addEventListener('click', () => switchToDay(button.getAttribute('data-day')));
  });
  elements.cancelSwitch.addEventListener('click', hideDaySwitcher);
  
  // Check for bonus quest periodically
  setInterval(checkForBonusQuest, 60000); // Check every minute
  
  // Load saved state from localStorage if available
  loadState();
}

// Avatar selection
function selectAvatar(avatarElement) {
  // Remove selected class from all avatars
  elements.avatars.forEach(a => a.classList.remove('selected'));
  
  // Add selected class to clicked avatar
  avatarElement.classList.add('selected');
  
  // Enable start button
  elements.startButton.disabled = false;
  
  // Save selected avatar type
  state.avatar = avatarElement.getAttribute('data-type');
}

// Start the quest
function startQuest() {
  if (!state.avatar) return;
  
  // Hide setup screen, show quests screen
  elements.setup.classList.remove('active-screen');
  elements.setup.classList.add('hidden-screen');
  elements.quests.classList.remove('hidden-screen');
  elements.quests.classList.add('active-screen');
  elements.toggleReflections.classList.remove('hidden');
  elements.dayNavigation.classList.remove('hidden');
  
  // Set user avatar
  const avatarIcons = {
    learner: '🎓',
    strategic: '🧠',
    relator: '🫂',
    discoverer: '🔍'
  };
  elements.userAvatar.textContent = avatarIcons[state.avatar];
  
  // Generate quests if we don't have any yet
  if (state.quests.length === 0) {
    generateQuests();
  }
  
  // Check for bonus quest
  checkForBonusQuest();
  
  // Display quests
  displayQuests();
  
  // Save state
  saveState();
}

// Generate quests based on avatar type
function generateQuests() {
  // Get quest templates for the selected avatar
  const templates = questTemplates[state.avatar];
  
  // Create 3 quests
  state.quests = templates.map((text, index) => ({
    id: Date.now() + index,
    text,
    completed: false
  }));
  
  // Reset bonus quest status
  state.hasBonus = false;
  state.bonusQuest = null;
}

// Display quests
function displayQuests() {
  // Clear quest list
  elements.questList.innerHTML = '';
  
  // Add each quest to the list
  state.quests.forEach(quest => {
    const questCard = document.createElement('div');
    questCard.className = `quest-card ${quest.completed ? 'quest-complete' : ''}`;
    questCard.dataset.id = quest.id;
    
    const questText = document.createElement('div');
    questText.className = 'quest-text';
    questText.textContent = quest.text;
    
    const questButtons = document.createElement('div');
    questButtons.className = 'quest-buttons';
    
    if (!quest.completed) {
      const completeButton = document.createElement('button');
      completeButton.className = 'complete-button';
      completeButton.textContent = 'Complete Quest';
      completeButton.addEventListener('click', () => completeQuest(quest.id));
      questButtons.appendChild(completeButton);
    }
    
    questCard.appendChild(questText);
    questCard.appendChild(questButtons);
    elements.questList.appendChild(questCard);
  });
  
  // Add bonus quest if available
  if (state.bonusQuest) {
    const bonusCard = document.createElement('div');
    bonusCard.className = `quest-card bonus-quest ${state.bonusQuest.completed ? 'quest-complete' : ''}`;
    bonusCard.dataset.id = state.bonusQuest.id;
    
    const questText = document.createElement('div');
    questText.className = 'quest-text';
    questText.innerHTML = `<span class="bonus-label">✨ ${state.bonusQuest.text}</span>`;
    
    const questButtons = document.createElement('div');
    questButtons.className = 'quest-buttons';
    
    if (!state.bonusQuest.completed) {
      const completeButton = document.createElement('button');
      completeButton.className = 'complete-button bonus-complete';
      completeButton.textContent = 'Complete Bonus';
      completeButton.addEventListener('click', () => completeQuest(state.bonusQuest.id));
      questButtons.appendChild(completeButton);
    }
    
    bonusCard.appendChild(questText);
    bonusCard.appendChild(questButtons);
    elements.questList.appendChild(bonusCard);
  }
  
  // Update XP display
  updateXP();
}

// Complete a quest
function completeQuest(questId) {
  // Find the quest
  const questIndex = state.quests.findIndex(q => q.id === questId);
  if (questIndex === -1) return;
  
  // Mark as completed
  state.quests[questIndex].completed = true;
  
  // Add to completed quests
  state.completedQuests.push(state.quests[questIndex]);
  
  // Add XP
  state.xp += 100;
  
  // Update display
  displayQuests();
  
  // Show confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  // Show reflection form
  showReflectionForm(questId);
  
  // Save state
  saveState();
}

// Show reflection form
function showReflectionForm(questId) {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest) return;
  
  // Store current quest ID in the form
  elements.reflectionForm.dataset.questId = questId;
  
  // Show form
  elements.reflectionForm.classList.remove('hidden');
  elements.reflectionText.value = '';
  elements.reflectionPhoto.value = '';
}

// Save reflection
function saveReflection() {
  const questId = parseInt(elements.reflectionForm.dataset.questId);
  const quest = state.quests.find(q => q.id === questId);
  if (!quest) return;
  
  // Get reflection text
  const text = elements.reflectionText.value.trim();
  
  // Get photo if available
  let photoData = null;
  const photoFile = elements.reflectionPhoto.files[0];
  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      addReflection(questId, quest.text, text, e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    addReflection(questId, quest.text, text, null);
  }
  
  // Hide form
  elements.reflectionForm.classList.add('hidden');
}

// Add reflection to state
function addReflection(questId, questText, reflectionText, photoData) {
  state.reflections.push({
    id: Date.now(),
    questId,
    questText,
    text: reflectionText,
    photo: photoData,
    date: new Date().toLocaleDateString()
  });
  
  // Save state
  saveState();
}

// Skip reflection
function skipReflection() {
  elements.reflectionForm.classList.add('hidden');
}

// Update XP display
function updateXP() {
  elements.xpValue.textContent = state.xp;
  
  // Calculate percentage (max 3 quests = 300 XP)
  const percentComplete = Math.min(state.xp / 300 * 100, 100);
  elements.xpProgress.style.width = `${percentComplete}%`;
}

// Show reflections screen
function showReflections() {
  elements.quests.classList.remove('active-screen');
  elements.quests.classList.add('hidden-screen');
  elements.reflections.classList.remove('hidden-screen');
  elements.reflections.classList.add('active-screen');
  
  // Display reflections
  displayReflections();
}

// Show quests screen
function showQuests() {
  elements.reflections.classList.remove('active-screen');
  elements.reflections.classList.add('hidden-screen');
  elements.quests.classList.remove('hidden-screen');
  elements.quests.classList.add('active-screen');
}

// Display reflections
function displayReflections() {
  // Clear reflection list
  elements.reflectionList.innerHTML = '';
  
  // If no reflections, show message
  if (state.reflections.length === 0) {
    const noReflections = document.createElement('p');
    noReflections.textContent = 'No reflections yet. Complete quests to add to your log!';
    noReflections.style.textAlign = 'center';
    elements.reflectionList.appendChild(noReflections);
    return;
  }
  
  // Add each reflection to the list (newest first)
  state.reflections.slice().reverse().forEach(reflection => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'reflection-entry';
    
    const questDiv = document.createElement('div');
    questDiv.className = 'reflection-quest';
    questDiv.textContent = reflection.questText;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'reflection-content';
    contentDiv.textContent = reflection.text || 'No reflection provided.';
    
    const dateDiv = document.createElement('div');
    dateDiv.className = 'reflection-date';
    dateDiv.textContent = reflection.date;
    
    entryDiv.appendChild(questDiv);
    entryDiv.appendChild(contentDiv);
    
    // Add photo if available
    if (reflection.photo) {
      const photo = document.createElement('img');
      photo.className = 'reflection-photo';
      photo.src = reflection.photo;
      photo.alt = 'Quest photo';
      entryDiv.appendChild(photo);
    }
    
    entryDiv.appendChild(dateDiv);
    elements.reflectionList.appendChild(entryDiv);
  });
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('confQuestState', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
  const savedState = localStorage.getItem('confQuestState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    Object.assign(state, parsedState);
    
    // If user is logged in, update the UI accordingly
    if (state.username && state.day) {
      // Skip login screen
      elements.login.classList.remove('active-screen');
      elements.login.classList.add('hidden-screen');
      
      // Show user info
      elements.userInfo.classList.remove('hidden');
      elements.displayUsername.textContent = state.username;
      elements.displayDay.textContent = state.day;
      
      // If user already has an avatar, set that up
      if (state.avatar) {
        // Display the setup screen
        elements.setup.classList.remove('hidden-screen');
        elements.setup.classList.add('active-screen');
        
        // Select the correct avatar in the UI
        elements.avatars.forEach(avatar => {
          if (avatar.getAttribute('data-type') === state.avatar) {
            avatar.classList.add('selected');
            elements.startButton.disabled = false;
          }
        });
        
        // Go straight to quests if they had started
        if (state.quests.length > 0) {
          startQuest();
        }
      } else {
        // Show the avatar selection screen
        elements.setup.classList.remove('hidden-screen');
        elements.setup.classList.add('active-screen');
      }
    }
  }
}

// Login form validation
function validateLoginForm() {
  const usernameValue = elements.username.value.trim();
  const daySelected = document.querySelector('.day-button.selected');
  
  elements.loginButton.disabled = !(usernameValue && daySelected);
}

// Day selection
function selectDay(buttonElement) {
  // Remove selected class from all day buttons
  elements.dayButtons.forEach(b => b.classList.remove('selected'));
  
  // Add selected class to clicked button
  buttonElement.classList.add('selected');
  
  // Validate form
  validateLoginForm();
}

// Process login
function processLogin() {
  // Get username and day
  const username = elements.username.value.trim();
  const dayButton = document.querySelector('.day-button.selected');
  
  if (!username || !dayButton) return;
  
  const day = dayButton.getAttribute('data-day');
  
  // Update state
  state.username = username;
  state.day = day;
  
  // Create a unique key for local storage based on user and day
  state.storageKey = `confQuest_${username}_day${day}`;
  
  // Update UI
  elements.displayUsername.textContent = username;
  elements.displayDay.textContent = day;
  elements.userInfo.classList.remove('hidden');
  
  // Update day switcher
  updateDaySwitcherButtons();
  
  // Hide login screen, show setup screen
  elements.login.classList.remove('active-screen');
  elements.login.classList.add('hidden-screen');
  elements.setup.classList.remove('hidden-screen');
  elements.setup.classList.add('active-screen');
  
  // Save state
  saveState();
}

// Override saveState to use the user+day specific key
function saveState() {
  const key = state.storageKey || 'confQuestState';
  localStorage.setItem(key, JSON.stringify(state));
}

// Override loadState with user+day specific key if available
function loadState() {
  // Try to find existing user sessions
  const userSessions = findUserSessions();
  
  if (userSessions.length > 0) {
    // For simplicity, just load the most recent session
    const mostRecentSession = userSessions[0];
    const savedState = localStorage.getItem(mostRecentSession.key);
    
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      Object.assign(state, parsedState);
      
      // Skip login screen
      elements.login.classList.remove('active-screen');
      elements.login.classList.add('hidden-screen');
      
      // Show user info
      elements.userInfo.classList.remove('hidden');
      elements.displayUsername.textContent = state.username;
      elements.displayDay.textContent = state.day;
      
      // If user already has an avatar, set that up
      if (state.avatar) {
        // Display the setup screen
        elements.setup.classList.remove('hidden-screen');
        elements.setup.classList.add('active-screen');
        
        // Select the correct avatar in the UI
        elements.avatars.forEach(avatar => {
          if (avatar.getAttribute('data-type') === state.avatar) {
            avatar.classList.add('selected');
            elements.startButton.disabled = false;
          }
        });
        
        // Go straight to quests if they had started
        if (state.quests.length > 0) {
          startQuest();
        }
      } else {
        // Show the avatar selection screen
        elements.setup.classList.remove('hidden-screen');
        elements.setup.classList.add('active-screen');
      }
    }
  }
}

// Helper function to find user sessions in localStorage
function findUserSessions() {
  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('confQuest_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        sessions.push({
          key,
          username: data.username,
          day: data.day,
          timestamp: new Date(data.quests.length > 0 ? data.quests[0].id : 0)
        });
      } catch (e) {
        console.error('Error parsing session data', e);
      }
    }
  }
  
  // Sort by most recent
  return sessions.sort((a, b) => b.timestamp - a.timestamp);
}

// Check for bonus quest
function checkForBonusQuest() {
  // Only add bonus quest after noon (12 PM)
  const currentHour = new Date().getHours();
  
  // For testing, you can comment this out to always show bonus quest
  if (currentHour < 12) {
    return;
  }
  
  // If we already have a bonus quest, don't add another
  if (state.hasBonus) {
    return;
  }
  
  // Get the bonus quest for the current day and avatar
  const dayKey = `day${state.day}`;
  if (bonusQuestTemplates[dayKey] && bonusQuestTemplates[dayKey][state.avatar]) {
    const bonusText = bonusQuestTemplates[dayKey][state.avatar];
    
    // Create bonus quest
    state.bonusQuest = {
      id: Date.now() + 1000, // Unique ID
      text: bonusText,
      completed: false,
      isBonus: true
    };
    
    state.hasBonus = true;
    
    // Update display
    displayQuests();
    
    // Save state
    saveState();
  }
}

// Show day switcher
function showDaySwitcher() {
  elements.daySwitcher.classList.remove('hidden');
  updateDaySwitcherButtons();
}

// Hide day switcher
function hideDaySwitcher() {
  elements.daySwitcher.classList.add('hidden');
}

// Update day switcher buttons to highlight current day
function updateDaySwitcherButtons() {
  elements.daySwitchButtons.forEach(button => {
    if (button.getAttribute('data-day') === state.day) {
      button.classList.add('current');
    } else {
      button.classList.remove('current');
    }
  });
}

// Switch to a different day
function switchToDay(day) {
  if (day === state.day) {
    hideDaySwitcher();
    return;
  }
  
  // Save current state
  saveState();
  
  // Update state with new day
  state.day = day;
  state.storageKey = `confQuest_${state.username}_day${day}`;
  
  // Clear current state data
  state.quests = [];
  state.completedQuests = [];
  state.hasBonus = false;
  state.bonusQuest = null;
  
  // Update UI
  elements.displayDay.textContent = day;
  
  // Try to load saved data for this day
  const savedState = localStorage.getItem(state.storageKey);
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      state.quests = parsedState.quests || [];
      state.completedQuests = parsedState.completedQuests || [];
      state.xp = parsedState.xp || 0;
      state.reflections = parsedState.reflections || [];
      state.hasBonus = parsedState.hasBonus || false;
      state.bonusQuest = parsedState.bonusQuest || null;
    } catch (e) {
      console.error('Error parsing saved state', e);
    }
  }
  
  // If no quests for this day yet, generate new ones
  if (state.quests.length === 0) {
    generateQuests();
  }
  
  // Check for bonus quest
  checkForBonusQuest();
  
  // Update UI
  displayQuests();
  updateDaySwitcherButtons();
  
  // Hide day switcher
  hideDaySwitcher();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);