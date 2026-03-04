let totalPlayers = 0;
let currentPlayer = 1;
let playerNames = [];
let allScores = [];

function setPlayerCount(num) {
    totalPlayers = num;
    const container = document.getElementById('names-container');
    container.innerHTML = "";
    for(let i=1; i<=num; i++) {
        container.innerHTML += `<input type="text" id="name-p${i}" placeholder="Nombre del Jugador ${i}" class="w-full p-4 rounded-2xl bg-slate-100 font-black border-2 border-transparent focus:border-amber-400 outline-none text-slate-700">`;
    }
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('step-names').classList.add('active');
}

function initRecuento() {
    playerNames = [];
    for(let i=1; i<=totalPlayers; i++) {
        playerNames.push(document.getElementById(`name-p${i}`).value || `Jugador ${i}`);
    }
    document.getElementById('step-names').classList.remove('active');
    document.getElementById('wizard-app').classList.remove('hidden');
    updateWizardUI();
}

function nextRecuentoStep(n) {
    document.querySelectorAll('.recuento-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`recuento${n}`).classList.remove('hidden');
    document.getElementById('step-indicator').innerText = `PASO ${n}/3`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateWizardUI() {
    document.getElementById('player-indicator').innerText = `RECUENTO: ${playerNames[currentPlayer-1].toUpperCase()}`;
    document.getElementById('save-btn').innerText = currentPlayer < totalPlayers ? `GUARDAR ${playerNames[currentPlayer-1].toUpperCase()} ➔` : "VER BALANCE FINAL 🏆";
}

function toggleSpiritUI() {
    const isChecked = document.getElementById('spirit-check').checked;
    document.getElementById('spirit-ui').classList.toggle('hidden', !isChecked);
}

function updateSpiritLogic() {
    const type = document.getElementById('spirit-type').value;
    const preview = document.getElementById('spirit-preview');
    const manualInput = document.getElementById('spirit-manual-pts');
    manualInput.classList.add('hidden');
    if(type === 'mountains') preview.innerText = "Bono: +4 pts por cada montaña H2 y H3 (aisladas incluidas).";
    else if(type === 'trees') preview.innerText = "Bono: +4 pts por cada árbol de tamaño 2 y 3.";
    else if(type === 'water') preview.innerText = "Bono: +2 pts adicionales por cada ficha azul.";
    else if(type === 'other') { preview.innerText = "Suma los puntos según la carta."; manualInput.classList.remove('hidden'); }
}

function savePlayerData() {
    const res = calculatePoints();
    allScores.push({
        name: playerNames[currentPlayer-1],
        points: res.total,
        cubes: Number(document.getElementById('tie-cubes').value)||0,
        solo: { sideA: document.getElementById('w-mode').value === 'A', spirit: document.getElementById('spirit-check').checked }
    });

    if(currentPlayer < totalPlayers) {
        currentPlayer++;
        resetInputs();
        updateWizardUI();
        nextRecuentoStep(1);
    } else {
        showFinalRanking();
    }
}

function calculatePoints() {
    // 1. Paisajes (Paso 1)
    const t2 = Number(document.getElementById('t2').value)||0, t3 = Number(document.getElementById('t3').value)||0;
    const m2 = Number(document.getElementById('m2').value)||0, m3 = Number(document.getElementById('m3').value)||0;
    const landscapes = (Number(document.getElementById('t1').value)||0)*1 + t2*3 + t3*7 + m2*3 + m3*7 + (Number(document.getElementById('fld').value)||0)*5 + (Number(document.getElementById('bld').value)||0)*5;
    
    // 2. Agua (Río Side A o Islas Side B)
    const wVal = Number(document.getElementById('w-val').value)||0;
    const water = document.getElementById('w-mode').value === 'A' 
        ? (wVal <= 2 ? 0 : wVal === 3 ? 5 : wVal === 4 ? 8 : wVal === 5 ? 11 : wVal === 6 ? 15 : 15 + (wVal-6)*4) : wVal * 5;

    // 3. Fauna (Paso 2)
    let fauna = 0;
    document.querySelectorAll('.fauna-input').forEach(i => fauna += Number(i.value)||0);

    // 4. Espíritus (Paso 3)
    let spiritBono = 0;
    if(document.getElementById('spirit-check').checked) {
        const type = document.getElementById('spirit-type').value;
        if(type === 'mountains') spiritBono = (m2 + m3) * 4;
        else if(type === 'trees') spiritBono = (t2 + t3) * 4;
        else if(type === 'water') spiritBono = wVal * 2;
        else if(type === 'other') spiritBono = Number(document.getElementById('spirit-manual-pts').value)||0;
    }
    
    return { total: landscapes + water + fauna + spiritBono };
}

function showFinalRanking() {
    // Desempate por cubos [4]
    allScores.sort((a,b) => b.points - a.points || b.cubes - a.cubes);
    document.querySelectorAll('.recuento-step').forEach(s => s.classList.add('hidden'));
    document.getElementById('step-indicator').classList.add('hidden');
    
    let html = `<h3 class="text-2xl font-black italic uppercase text-slate-800 mb-6 tracking-tighter">🏆 Balance de Victoria</h3>`;
    allScores.forEach((s, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
        html += `<div class="flex justify-between items-center bg-slate-800 p-5 rounded-3xl text-white shadow-lg mb-3 border border-slate-700">
                    <div class="text-left"><p class="font-black italic text-lg">${medal} ${s.name}</p></div>
                    <div class="text-right text-amber-400 font-black text-3xl">${s.points}<small class="text-xs ml-1">pts</small></div>
                 </div>`;
    });

    if(totalPlayers === 1) {
        const p = allScores;
        const table = { 40:1, 70:2, 90:3, 110:4, 130:5, 140:6, 150:7, 160:8 };
        let count = 0;
        Object.keys(table).forEach(pts => { if(p.points >= pts) count = table[pts]; });
        if(p.solo.sideA) count++;
        if(p.solo.spirit) count++;
        document.getElementById('solo-info').classList.remove('hidden');
        document.getElementById('soles-display').innerText = "☀️".repeat(Math.min(count, 8));
    }
    document.getElementById('ranking-list').innerHTML = html;
    document.getElementById('ranking-screen').classList.remove('hidden');
}

function resetInputs() {
    document.querySelectorAll('input[type="number"]').forEach(i => i.value = "");
    document.getElementById('spirit-check').checked = false;
    toggleSpiritUI();
}

window.onload = () => {
    const grid = document.getElementById('fauna-grid');
    for(let i=1; i<=9; i++) {
        grid.innerHTML += `
            <div class="bg-white rounded-2xl p-2 text-center shadow-sm border border-amber-100">
                <img src="assets/FAUNA${i}.png" class="w-full aspect-square rounded-xl object-cover mb-2" onerror="this.src='https://placehold.co/100?text=🐾'">
                <input type="number" placeholder="Pts" class="fauna-input w-full p-1 text-center text-sm font-black bg-amber-50 rounded-lg outline-none">
            </div>`;
    }
};