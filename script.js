let totalPlayers = 0;
let currentPlayer = 1;
let playerNames = [];
let allScores = [];

function setPlayerCount(num) {
    totalPlayers = num;
    const container = document.getElementById('names-container');
    container.innerHTML = "";
    for(let i=1; i<=num; i++) {
        container.innerHTML += `<input type="text" id="name-p${i}" placeholder="Nombre de la Especie ${i}" class="w-full p-4 rounded-2xl bg-slate-100 font-bold outline-none focus:ring-2 focus:ring-amber-400">`;
    }
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('step-names').classList.add('active');
}

function initRecuento() {
    for(let i=1; i<=totalPlayers; i++) {
        playerNames.push(document.getElementById(`name-p${i}`).value || `Especie ${i}`);
    }
    document.getElementById('step-names').classList.remove('active');
    document.getElementById('main-app').classList.remove('hidden');
    updateWizardUI();
}

function nextRecuentoStep(n) {
    document.querySelectorAll('.recuento-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`recuento${n}`).classList.remove('hidden');
    document.getElementById('step-indicator').innerText = `PASO ${n}/3`;
}

function updateWizardUI() {
    document.getElementById('player-indicator').innerText = `TURNO DE: ${playerNames[currentPlayer-1].toUpperCase()}`;
    document.getElementById('save-btn').innerText = currentPlayer < totalPlayers ? `GUARDAR ${playerNames[currentPlayer-1].toUpperCase()} ➔` : "VER BALANCE FINAL 🏆";
}

function savePlayerData() {
    const pts = calculateTotal();
    allScores.push({
        name: playerNames[currentPlayer-1],
        points: pts.total,
        cubes: Number(document.getElementById('tie-cubes').value)||0,
        solitaire: { sideA: pts.sideA, spirit: pts.spirit }
    });

    if(currentPlayer < totalPlayers) {
        currentPlayer++;
        resetForm();
        updateWizardUI();
        nextRecuentoStep(1);
    } else {
        showRanking();
    }
}

function calculateTotal() {
    const trees = (Number(document.getElementById('t1').value)||0)*1 + (Number(document.getElementById('t2').value)||0)*3 + (Number(document.getElementById('t3').value)||0)*7;
    const mnt = (Number(document.getElementById('m2').value)||0)*3 + (Number(document.getElementById('m3').value)||0)*7;
    const fields = (Number(document.getElementById('fld').value)||0)*5;
    const bld = (Number(document.getElementById('bld').value)||0)*5;
    
    const wVal = Number(document.getElementById('w-val').value)||0;
    const water = document.getElementById('w-mode').value === 'A' 
        ? (wVal <= 2 ? 0 : wVal === 3 ? 5 : wVal === 4 ? 8 : wVal === 5 ? 11 : wVal === 6 ? 15 : 15 + (wVal-6)*4)
        : wVal * 5;

    let fauna = 0;
    document.querySelectorAll('.fauna-input').forEach(i => fauna += Number(i.value)||0);
    let spirit = document.getElementById('spirit-check').checked ? (Number(document.getElementById('spirit-pts').value)||0) : 0;
    
    return { total: trees + mnt + fields + bld + water + fauna + spirit, sideA: document.getElementById('w-mode').value === 'A', spirit: document.getElementById('spirit-check').checked };
}

function showRanking() {
    allScores.sort((a,b) => b.points - a.points || b.cubes - a.cubes);
    document.querySelectorAll('.recuento-step').forEach(s => s.classList.add('hidden'));
    document.getElementById('step-indicator').classList.add('hidden');
    
    let html = `<h3 class="text-2xl font-black italic uppercase tracking-tighter text-slate-800 mb-4">🏆 Balance de Victoria</h3>`;
    allScores.forEach((s, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
        html += `<div class="flex justify-between items-center bg-slate-800 p-5 rounded-3xl text-white border border-slate-700 shadow-lg">
                    <div class="text-left"><p class="text-[10px] font-bold text-slate-400 uppercase">Puesto ${i+1}</p><p class="font-black italic">${medal} ${s.name}</p></div>
                    <div class="text-right text-amber-400 font-black text-3xl">${s.points}<span class="text-xs ml-1">pts</span></div>
                 </div>`;
    });
    
    if(totalPlayers === 1) {
        const s = allScores;
        const table = { 40:1, 70:2, 90:3, 110:4, 130:5, 140:6, 150:7, 160:8 };
        let count = 0;
        Object.keys(table).forEach(p => { if(s.points >= p) count = table[p]; });
        if(s.solitaire.sideA) count++;
        if(s.solitaire.spirit) count++;
        document.getElementById('solo-result').classList.remove('hidden');
        document.getElementById('soles-display').innerText = "☀️".repeat(Math.min(count, 8));
    }

    document.getElementById('ranking-list').innerHTML = html;
    document.getElementById('ranking-screen').classList.remove('hidden');
}

function resetForm() {
    document.querySelectorAll('input[type="number"]').forEach(i => i.value = "");
    document.getElementById('spirit-check').checked = false;
}

function resetApp() { location.reload(); }

window.onload = () => {
    const grid = document.getElementById('fauna-grid');
    for(let i=1; i<=9; i++) {
        grid.innerHTML += `
            <div class="bg-white rounded-2xl p-2 text-center shadow-sm border border-amber-200">
                <img src="assets/FAUNA${i}.png" class="w-full aspect-square rounded-xl object-cover mb-2" onerror="this.src='https://placehold.co/100?text=F${i}'">
                <input type="number" placeholder="Pts" class="fauna-input w-full p-1 text-center text-sm font-bold bg-amber-50 rounded-lg">
            </div>`;
    }
};