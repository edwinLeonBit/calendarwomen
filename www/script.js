const STORAGE_KEY = 'cicloData';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const monthsNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

let currentDate = new Date();
currentDate.setDate(1); // evita saltos de mes al navegar desde el día 31
let lastPeriodDate = null;
let cycleLength = 28;
let periodLength = 5;

function saveData(dateStr) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastPeriod: dateStr, cycleLength, periodLength }));
    } catch (e) {
        console.error('No se pudo guardar:', e);
    }
}

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data.lastPeriod) return;
        document.getElementById('last-period').value = data.lastPeriod;
        document.getElementById('cycle-length').value = data.cycleLength;
        document.getElementById('period-length').value = data.periodLength;
        cycleLength = data.cycleLength;
        periodLength = data.periodLength;
        lastPeriodDate = new Date(data.lastPeriod + 'T00:00:00');
        currentDate = new Date();
        currentDate.setDate(1);
    } catch (e) {
        console.error('Datos guardados inválidos:', e);
        localStorage.removeItem(STORAGE_KEY);
    }
}

document.getElementById('calculate-btn').addEventListener('click', () => {
    const lastPeriodInput = document.getElementById('last-period').value;
    const cycle = parseInt(document.getElementById('cycle-length').value, 10);
    const period = parseInt(document.getElementById('period-length').value, 10);

    if (!lastPeriodInput) {
        alert("Por favor selecciona la fecha de tu última regla.");
        return;
    }
    if (Number.isNaN(cycle) || cycle < 20 || cycle > 45) {
        alert("La duración del ciclo debe estar entre 20 y 45 días.");
        return;
    }
    if (Number.isNaN(period) || period < 1 || period > 10) {
        alert("La duración de la regla debe estar entre 1 y 10 días.");
        return;
    }
    if (period >= cycle) {
        alert("La duración de la regla debe ser menor que la del ciclo.");
        return;
    }

    cycleLength = cycle;
    periodLength = period;
    lastPeriodDate = new Date(lastPeriodInput + 'T00:00:00');
    saveData(lastPeriodInput);

    // Mostrar el mes de la fecha ingresada
    currentDate = new Date(lastPeriodDate.getFullYear(), lastPeriodDate.getMonth(), 1);
    renderCalendar();
});

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('month-year-display').innerText = `${monthsNames[month]} ${year}`;

    const daysGrid = document.getElementById('days-grid');
    daysGrid.innerHTML = '';

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes como inicio
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDayIndex; i++) {
        daysGrid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.innerText = day;

        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayDiv.classList.add('today');
        }

        if (lastPeriodDate) {
            const status = getDayStatus(new Date(year, month, day));
            if (status) dayDiv.classList.add(status);
        }

        daysGrid.appendChild(dayDiv);
    }
}

function getDayStatus(date) {
    // Date.UTC con componentes locales: inmune al cambio de horario (DST)
    const a = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const b = Date.UTC(lastPeriodDate.getFullYear(), lastPeriodDate.getMonth(), lastPeriodDate.getDate());
    const diffDays = Math.round((a - b) / MS_PER_DAY);

    if (diffDays < 0) return null;

    const dayInCycle = diffDays % cycleLength; // base 0

    if (dayInCycle < periodLength) return 'period';

    // Ovulación ≈ 14 días antes de la próxima regla. Con índice base 0: cycleLength - 15
    const ovulationDay = cycleLength - 15;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;

    if (dayInCycle >= fertileStart && dayInCycle <= fertileEnd) return 'fertile';

    return 'infertile';
}

loadData();
renderCalendar();
