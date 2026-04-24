// script.js

const display = document.getElementById('display');
const listInput = document.getElementById('listInput');
const totalResult = document.getElementById('totalResult');
const itemsCount = document.getElementById('itemsCount');

// --- 1. SOPORTE PARA TECLADO ---
document.addEventListener('keydown', (e) => {
    // Si el usuario está escribiendo en el textarea, no activar la calculadora
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
        // Usamos Function en lugar de eval por seguridad
        const result = new Function('return ' + display.value)();
        display.value = Number.isInteger(result) ? result : result.toFixed(2);
    } catch {
        display.value = 'Error';
        setTimeout(clearDisplay, 1000);
    }
}

// --- 3. SUMADORA MULTIFORMATO (El "Cerebro") ---
function processList() {
    const text = listInput.value;
    
    // Esta expresión regular busca montos de dinero:
    // Soporta: $1.000,00 | 1000.00 | 1.000 | 1000
    // Lógica: Divide el texto por espacios, saltos de línea o el símbolo $
    const segments = text.split(/[\n\s$]+/).filter(s => s.trim() !== "");
    
    let total = 0;
    let count = 0;

    segments.forEach(seg => {
        // Limpiamos el segmento
        // Si tiene una coma y un punto (ej: 1.200,50), quitamos el punto y cambiamos coma por punto
        // Si solo tiene coma (ej: 1200,50), cambiamos coma por punto
        let clean = seg;

        if (clean.includes(',') && clean.includes('.')) {
            clean = clean.replace(/\./g, '').replace(',', '.');
        } else if (clean.includes(',')) {
            // Caso donde la coma se usa como decimal pero no hay puntos de miles
            clean = clean.replace(',', '.');
        }

        const num = parseFloat(clean);
        if (!isNaN(num)) {
            total += num;
            count++;
        }
    });

    // Formatear el resultado
    totalResult.innerText = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(total);

    itemsCount.innerText = `${count} ítems`;
}

function clearList() {
    listInput.value = '';
    processList();
}