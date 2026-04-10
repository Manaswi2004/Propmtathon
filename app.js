// State & Auth Management
let currentUser = localStorage.getItem('hm_user_session') || null;
let state = { waterIntake: 0, lastActiveDate: new Date().toDateString(), streak: 0, loggedFoods: [] };
let selectedMoods = ['tired'];
let stagedFood = null; // Staged from AI

// Global DOM
const views = document.querySelectorAll('.view');
const nav = document.getElementById('mainNav');
const navBtns = document.querySelectorAll('.nav-btn');

function init() {
    setupAuthListeners();
    setupNavigation();
    setupAssistant();
    setupHabits();
    setupEmergencyDelivery();

    if (currentUser) {
        bootUserSession();
    } else {
        switchView('view-login');
        nav.style.display = 'none';
    }
}

function setupAuthListeners() {
    const form = document.getElementById('loginForm');
    const uIn = document.getElementById('usernameInput');
    const logOutBtn = document.getElementById('logoutAppBtn');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = uIn.value.trim();
            if(!val) return;
            currentUser = val;
            localStorage.setItem('hm_user_session', currentUser);
            bootUserSession();
        });
    }

    if(logOutBtn) {
        logOutBtn.addEventListener('click', () => {
            if(confirm('Terminate link for ' + currentUser + '?')) {
                currentUser = null;
                localStorage.removeItem('hm_user_session');
                state = { waterIntake: 0, lastActiveDate: new Date().toDateString(), streak: 0, loggedFoods: [] };
                nav.style.display = 'none';
                if(form) form.reset();
                switchView('view-login');
            }
        });
    }
}

function bootUserSession() {
    const saved = localStorage.getItem(`hm_state_${currentUser}`);
    if (saved) state = JSON.parse(saved);
    else state = { waterIntake: 0, lastActiveDate: new Date().toDateString(), streak: 0, loggedFoods: [] };

    checkDailyReset();
    
    // Switch to Dashboard
    nav.style.display = 'flex';
    navBtns.forEach(b => b.classList.remove('active'));
    navBtns[0].classList.add('active'); 
    switchView('view-dashboard');
    updateDashboardUI();
}

function switchView(id) {
    views.forEach(v => {
        if(v.id === id) v.classList.add('active');
        else v.classList.remove('active');
    });
}

function checkDailyReset() {
    const today = new Date().toDateString();
    if (state.lastActiveDate !== today) {
        const yest = new Date(); yest.setDate(yest.getDate() - 1);
        if (state.lastActiveDate === yest.toDateString()) state.streak += 1;
        else state.streak = 1; 
        
        state.waterIntake = 0; state.loggedFoods = []; 
        state.lastActiveDate = today;
        saveState();
    }
}

function saveState() {
    if(currentUser) localStorage.setItem(`hm_state_${currentUser}`, JSON.stringify(state));
    updateDashboardUI();
}

function setupNavigation() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchView(btn.getAttribute('data-target'));
        });
    });
}

function setupHabits() {
    const wBtn = document.getElementById('addWaterBtn');
    if(!wBtn) return;
    wBtn.addEventListener('click', () => {
        if(state.waterIntake < 8) {
            state.waterIntake++;
            saveState();
        }
    });
}

function updateDashboardUI() {
    if(!currentUser) return;
    document.getElementById('greetingLabel').textContent = `Welcome, ${currentUser}`;
    document.getElementById('waterLabel').textContent = `${state.waterIntake} / 8 Units`;
    document.getElementById('waterProgress').style.width = `${(state.waterIntake / 8) * 100}%`;
    document.getElementById('streakCount').textContent = `${state.streak} Cycles`;

    let tc=0, tp=0, tcarb=0, tf=0;
    state.loggedFoods.forEach(f => {
        tc+=f.cal; tp+=f.p; tcarb+=f.c; tf+=f.f;
    });

    document.getElementById('totCal').textContent = tc;
    document.getElementById('totP').textContent = tp+'g';
    document.getElementById('totC').textContent = tcarb+'g';
    document.getElementById('totF').textContent = tf+'g';

    renderFoodLog();
}

function renderFoodLog() {
    const list = document.getElementById('foodLogList');
    if(!list) return;
    if(state.loggedFoods.length === 0) {
        list.innerHTML = '<div class="glass-panel log-empty">Matrix empty. Utilize Assistant.</div>';
        return;
    }
    list.innerHTML = '';
    [...state.loggedFoods].reverse().forEach(food => {
        const d = document.createElement('div');
        d.className = 'glass-panel log-item';
        d.innerHTML = `
            <span class="log-item-name">${food.name}</span>
            <span class="log-item-cal">${food.cal} cal</span>
        `;
        list.appendChild(d);
    });
}

// ---------------- ALGORITHMS & SCI FI AI ----------------
function setupAssistant() {
    const modeBtns = document.querySelectorAll('.mode-btn');
    const decide = document.getElementById('decideBtn');
    const reset = document.getElementById('resetBtn');

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const t = btn.getAttribute('data-tag');
            if(btn.classList.contains('active')) {
                if(!selectedMoods.includes(t)) selectedMoods.push(t);
            } else {
                selectedMoods = selectedMoods.filter(x => x !== t);
            }
        });
    });

    decide.addEventListener('click', () => {
        document.getElementById('inputView').style.display = 'none';
        document.getElementById('loaderUI').style.display = 'flex';
        
        setTimeout(() => {
            runOptimizationMatrix();
            document.getElementById('loaderUI').style.display = 'none';
            document.getElementById('resultContainer').style.display = 'flex';
        }, 1500);
    });

    reset.addEventListener('click', () => {
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('inputView').style.display = 'flex';
    });

    document.getElementById('logBtnAction').addEventListener('click', () => {
        if(stagedFood) {
            state.loggedFoods.push(stagedFood);
            saveState();
            alert(`Directive logged: ${stagedFood.name}`);
        }
    });
}

function runOptimizationMatrix() {
    if(typeof foodDB === 'undefined') return;
    const hungerVal = parseInt(document.getElementById('hungerSlider').value);

    let results = foodDB.map(food => {
        let sc = 0;
        food.tags.forEach(t => { if(selectedMoods.includes(t)) sc += 2; });
        if (hungerVal === 1 && food.cal < 200) sc += 3;
        if (hungerVal === 2 && food.cal >= 200 && food.cal <= 400) sc += 3;
        if (hungerVal === 3 && (food.cal > 400 || food.tags.includes("filling"))) sc += 3;
        return { food, sc };
    });

    results.sort((a,b) => b.sc - a.sc);
    stagedFood = results[0].food;

    document.getElementById('resTitle').textContent = stagedFood.name;
    document.getElementById('resMacros').textContent = `🔥 ${stagedFood.cal} Cal · 🍗 ${stagedFood.p}g Prot`;
    
    let txt = `Optimal composition. `;
    if(stagedFood.p > 20) txt += `Elevated protein matrix ensures efficient cellular repair. `;
    if(stagedFood.cal < 200) txt += `Minimal caloric payload designed for system lightness. `;
    if(stagedFood.tags.includes("energy")) txt += `Accelerates energy synthesis pathways. `;
    document.getElementById('resDesc').textContent = txt.trim() === 'Optimal composition.' ? 'Balanced matrix selection suitable for current status.' : txt;
}

// ---------------- DELIVERY ----------------
function setupEmergencyDelivery() {
    const btn = document.getElementById('sosDeliveryBtn');
    if(!btn) return;

    btn.addEventListener('click', () => {
        if(typeof foodDB === 'undefined') return;
        const eFoods = foodDB.filter(f => f.isEmergencyReady).sort((a,b) => a.prepMins - b.prepMins);
        const tf = eFoods[0] || foodDB[0];

        btn.parentElement.style.display = 'none';
        document.getElementById('deliveryRadarUI').style.display = 'flex';
        document.getElementById('delivItem').textContent = `Inbound: ${tf.name} (${tf.prepMins}m Prep)`;
        
        startSimulatedDelivery(tf, btn);
    });
}

function startSimulatedDelivery(food, sosBtn) {
    const tmr = document.getElementById('delivTimer');
    const drone = document.getElementById('radarDroneDot');
    const status = document.getElementById('delivStatus');

    let rem = 10;
    status.textContent = "Drone Dispatched...";
    status.style.color = "#ef4444";
    tmr.textContent = `00:10`;
    
    drone.style.top = '10%'; drone.style.right = '10%';
    
    const iv = setInterval(() => {
        rem--;
        tmr.textContent = `00:${rem.toString().padStart(2,'0')}`;
        const p = (10 - rem)/10;
        const c = 10 + (35 * p);
        drone.style.top = `${c}%`; drone.style.right = `${c}%`;

        if(rem === 4) status.textContent = "Approaching drop zone...";
        if(rem <= 0) {
            clearInterval(iv);
            tmr.textContent = "ARRIVED";
            status.textContent = "Package Secured!";
            status.style.color = "var(--neon-green)";

            state.loggedFoods.push(food);
            saveState();

            setTimeout(() => {
                alert(`Order arrived: ${food.name}. Stored in Matrix.`);
                sosBtn.parentElement.style.display = 'block';
                document.getElementById('deliveryRadarUI').style.display = 'none';
            }, 1000);
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
