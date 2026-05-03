const display = document.getElementById('display');
const listInput = document.getElementById('listInput');
const totalResult = document.getElementById('totalResult');
const totalIngresos = document.getElementById('totalIngresos');
const totalEgresos = document.getElementById('totalEgresos');
const itemsCount = document.getElementById('itemsCount');

// --- 1. SOPORTE PARA TECLADO ---
document.addEventListener('keydown', (e) => {
    if (document.activeElement === listInput) return;
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (['+', '-', '*', '/'].includes(e.key)) appendOperator(e.key);
    if (e.key === 'Enter') { e.preventDefault(); calculate(); }
    if (e.key === 'Backspace') deleteLast();
    if (e.key === 'Escape') clearDisplay();
});

// --- 2. LÓGICA CALCULADORA ---
function appendNumber(num) {
    if (display.value === '0') display.value = '';
    display.value += num;
}
function appendOperator(op) {
    const last = display.value.slice(-1);
    if (['+', '-', '*', '/'].includes(last)) {
        display.value = display.value.slice(0, -1) + op;
    } else if (display.value !== '') {
        display.value += op;
    }
}
function clearDisplay() { display.value = ''; }
function deleteLast() { display.value = display.value.slice(0, -1); }
function calculate() {
    try {
        const result = new Function('return ' + display.value)();
        display.value = Number.isInteger(result) ? result : result.toFixed(2);
    } catch {
        display.value = 'Error';
        setTimeout(clearDisplay, 1000);
    }
}

// --- 3. LÓGICA DE PROCESAMIENTO INTELIGENTE (CEREBRO) ---
function processList() {
    const text = listInput.value;
    // Dividimos por saltos de línea o espacios, limpiando símbolos de moneda
    const lines = text.split(/[\n\s]+/).filter(l => l.trim() !== "");
    
    let sumaIngresos = 0;
    let sumaEgresos = 0;
    let count = 0;

    lines.forEach(line => {
        let isEgreso = false;
        let str = line.trim().replace('$', '');

        // Detectar Egreso por paréntesis
        if (str.startsWith('(') && str.endsWith(')')) {
            isEgreso = true;
            str = str.replace('(', '').replace(')', '');
        }

        // --- LIMPIEZA MULTIFORMATO EXTREMA ---
        const lastDot = str.lastIndexOf('.');
        const lastComma = str.lastIndexOf(',');

        if (lastComma > lastDot) {
            // Formato: 93.433,90 -> El decimal es la COMA
            // Borramos los puntos (miles) y convertimos la coma en punto decimal para JS
            str = str.replace(/\./g, '').replace(',', '.');
        } else if (lastDot > lastComma) {
            // Formato: 93,433.90 -> El decimal es el PUNTO
            // Borramos las comas (miles)
            str = str.replace(/,/g, '');
        } else {
            // No hay separadores o solo hay uno (ej: 1500 o 1500,50 o 1500.50)
            str = str.replace(',', '.');
        }

        const num = parseFloat(str);
        
        if (!isNaN(num)) {
            if (isEgreso) sumaEgresos += num;
            else sumaIngresos += num;
            count++;
        }
    });

    const totalNeto = sumaIngresos - sumaEgresos;
    const formatter = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    });

    // Actualizar valores en pantalla
    totalIngresos.innerText = formatter.format(sumaIngresos);
    totalEgresos.innerText = formatter.format(sumaEgresos);
    totalResult.innerText = formatter.format(totalNeto);
    
    // Cambiar color según el resultado neto
    if (totalNeto > 0) totalResult.style.color = "#4ade80"; // Verde
    else if (totalNeto < 0) totalResult.style.color = "#f87171"; // Rojo
    else totalResult.style.color = "white";

    itemsCount.innerText = `${count} ítems`;
}

function clearList() {
    listInput.value = '';
    processList();
}
