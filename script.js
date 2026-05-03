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

// --- 3. SUMADORA MULTIFORMATO CON DETECCIÓN DE EGRESOS ---
function processList() {
    const text = listInput.value;
    
    // Dividir por líneas o espacios, ignorando vacíos
    const lines = text.split(/[\n\s]+/).filter(l => l.trim() !== "");
    
    let sumaIngresos = 0;
    let sumaEgresos = 0;
    let count = 0;

    lines.forEach(line => {
        let isEgreso = false;
        let clean = line.trim();

        // Detectar si el número está entre paréntesis (egreso)
        if (clean.startsWith('(') && clean.endsWith(')')) {
            isEgreso = true;
            clean = clean.replace('(', '').replace(')', '');
        }

        // Limpieza de formato monetario ($1.000,00 -> 1000.00)
        clean = clean.replace('$', '');
        if (clean.includes(',') && clean.includes('.')) {
            clean = clean.replace(/\./g, '').replace(',', '.');
        } else if (clean.includes(',')) {
            clean = clean.replace(',', '.');
        }

        const num = parseFloat(clean);
        
        if (!isNaN(num)) {
            if (isEgreso) {
                sumaEgresos += num;
            } else {
                sumaIngresos += num;
            }
            count++;
        }
    });

    const totalNeto = sumaIngresos - sumaEgresos;

    // Formateador de moneda
    const formatter = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    });

    // Actualizar Interfaz
    totalIngresos.innerText = formatter.format(sumaIngresos);
    totalEgresos.innerText = formatter.format(sumaEgresos);
    totalResult.innerText = formatter.format(totalNeto);
    
    // Cambiar color del total si es negativo o positivo
    totalResult.className = totalNeto >= 0 
        ? "text-4xl font-bold text-white block mt-1 tracking-tight" 
        : "text-4xl font-bold text-red-500 block mt-1 tracking-tight";

    itemsCount.innerText = `${count} ítems`;
}

function clearList() {
    listInput.value = '';
    processList();
}

