// Sistema de depuración
window.onerror = (msg, url, line) => {
    console.error(`❌ Error en Equora: ${msg} | Línea: ${line}`);
    return false;
};

let totalPlayers = 0;
let currentPlayer = 1;
let playerNames = [];
let allScores = [];

function setPlayerCount(num) {
    totalPlayers = num;
    const container = document.getElementById('names-container');
    container.innerHTML = "";
    for(let i=1; i<=num; i++) {
        container.innerHTML += `<input type="text" id="name-p${i}" placeholder="Nombre Jugador ${i}" class="w-full p-4 rounded-2xl bg-slate-100 font-black border-none outline-none focus:ring-2 focus:ring-emerald-500">`;
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
}

function updateWizardUI() {
    document.getElementById('player-indicator').innerText = `RECUENTO: ${playerNames[currentPlayer-1].toUpperCase()}`;
    document.getElementById('save-btn').innerText = currentPlayer < totalPlayers ? `SIGUIENTE JUGADOR ➔` : "VER RESULTADOS 🏆";
}

function toggleSpiritUI() {
    document.getElementById('spirit-ui').classList.toggle('hidden', !document.getElementById('spirit-check').checked);
}

function updateSpiritLogic() {
    const type = document.getElementById('spirit-type').value;
    const preview = document.getElementById('spirit-preview');
    const manual = document.getElementById('spirit-manual-pts');
    manual.classList.toggle('hidden', type !== 'other');
    if(type === 'mountains') preview.innerText = "Bono: +4 pts por cada montaña H2 y H3 (incluye aisladas).";
    else if(type === 'trees') preview.innerText = "Bono: +4 pts por cada árbol de tamaño 2 y 3.";
    else if(type === 'water') preview.innerText = "Bono: +2 pts por cada ficha azul en el tablero.";
    else preview.innerText = "";
}

function savePlayerData() {
    const pts = calculateTotal();
    allScores.push({
        name: playerNames[currentPlayer-1],
        points: pts.total,
        cubes: Number(document.getElementById('tie-cubes').value)||0,
        soloData: { sideA: document.getElementById('w-mode').value === 'A', spirit: document.getElementById('spirit-check').checked }
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

function calculateTotal() {
    const t1 = Number(document.getElementById('t1').value)||0, t2 = Number(document.getElementById('t2').value)||0, t3 = Number(document.getElementById('t3').value)||0;
    const m2 = Number(document.getElementById('m2').value)||0, m3 = Number(document.getElementById('m3').value)||0;
    const fields = (Number(document.getElementById('fld').value)||0)*5, buildings = (Number(document.getElementById('bld').value)||0)*5;
    const landscapeBase = (t1*1 + t2*3 + t3*7) + (m2*3 + m3*7) + fields + buildings;

    const wVal = Number(document.getElementById('w-val').value)||0;
    const water = document.getElementById('w-mode').value === 'A' 
        ? (wVal <= 2 ? 0 : wVal === 3 ? 5 : wVal === 4 ? 8 : wVal === 5 ? 11 : wVal === 6 ? 15 : 15 + (wVal-6)*4) : wVal * 5;

    let fauna = 0;
    document.querySelectorAll('.fauna-input').forEach(i => fauna += Number(i.value)||0);

    let spirit = 0;
    if(document.getElementById('spirit-check').checked) {
        const type = document.getElementById('spirit-type').value;
        if(type === 'mountains') spirit = (m2 + m3) * 4;
        else if(type === 'trees') spirit = (t2 + t3) * 4;
        else if(type === 'water') spirit = wVal * 2;
        else if(type === 'other') spirit = Number(document.getElementById('spirit-manual-pts').value)||0;
    }
    return { total: landscapeBase + water + fauna + spirit };
}

function showFinalRanking() {
    allScores.sort((a,b) => b.points - a.points || b.cubes - a.cubes);
    document.getElementById('wizard-app').innerHTML = `
        <div class="p-8 space-y-6">
            <h2 class="text-3xl font-black italic uppercase text-slate-800 text-center">🏆 Balance Final</h2>
            <div id="ranking-list" class="space-y-4"></div>
            <div id="solo-box" class="hidden p-6 bg-amber-400 rounded-3xl text-center border-4 border-white shadow-xl">
                <p class="text-xs font-black uppercase italic">Nivel de Éxito Solitario</p>
                <p id="soles" class="text-5xl mt-2"></p>
            </div>
            <button onclick="location.reload()" class="w-full bg-slate-800 text-white font-black py-5 rounded-2xl uppercase tracking-widest italic">Nueva Partida</button>
        </div>`;

    allScores.forEach((s, i) => {
        const medal = i === 0 ? '🥇' : '👤';
        document.getElementById('ranking-list').innerHTML += `
            <div class="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div><p class="text-[10px] font-bold text-slate-400 uppercase">Puesto ${i+1}</p><p class="text-lg font-black italic text-slate-800">${medal} ${s.name}</p></div>
                <div class="text-3xl font-black text-emerald-600">${s.points}<span class="text-xs ml-1">pts</span></div>
            </div>`;
    });

    if(totalPlayers === 1) {
        const p = allScores;
        const table = { 40:1, 70:2, 90:3, 110:4, 130:5, 140:6, 150:7, 160:8 };
        let count = 0;
        Object.keys(table).forEach(v => { if(p.points >= Number(v)) count = table[v]; });
        if(p.soloData.sideA) count++;
        if(p.soloData.spirit) count++;
        document.getElementById('solo-box').classList.remove('hidden');
        document.getElementById('soles').innerText = "☀️".repeat(Math.min(count, 8));
    }
}

function resetInputs() {
    document.querySelectorAll('input').forEach(i => i.value = "");
    document.getElementById('spirit-check').checked = false;
    toggleSpiritUI();
}

window.onload = () => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
    const grid = document.getElementById('fauna-grid');
    for(let i=1; i<=9; i++) {
        grid.innerHTML += `
            <div class="bg-white rounded-2xl p-2 text-center shadow-sm border border-slate-50">
                <img src="assets/FAUNA${i}.png" 
                     onerror="this.src='https://placehold.co/100?text=🐾';" 
                     class="w-full aspect-square rounded-xl object-cover mb-2" 
                     alt="Animal ${i}">
                <input type="number" placeholder="Pts" class="fauna-input w-full p-1 text-center font-black bg-amber-50 rounded-lg outline-none focus:ring-2 focus:ring-amber-300">
            </div>`;
    }
};