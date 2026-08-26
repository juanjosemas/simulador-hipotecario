const ids = ["capital", "months", "rate", "type", "extra", "reduce", "fee", "altRate"];

// Escucha cambios en los inputs para recalcular automáticamente
ids.forEach(id => document.getElementById(id).addEventListener("input", calc));
ids.forEach(id => document.getElementById(id).addEventListener("change", calc));

// Formateador de moneda Euro
const euro = n => new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
}).format(n);

// Función para calcular la cuota mensual (Sistema Francés)
function monthlyPayment(P, n, annual) {
    const r = annual / 100 / 12;
    if (n <= 0) return 0;
    return r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n));
}

// Función principal de cálculo
function calc() {
    let P = Math.max(0, +document.getElementById("capital").value || 0);
    let n = Math.max(1, Math.floor(+document.getElementById("months").value || 1));
    let rate = Math.max(0, +document.getElementById("rate").value || 0);
    let extra = Math.max(0, +document.getElementById("extra").value || 0);
    let feePct = Math.max(0, +document.getElementById("fee").value || 0);
    let alt = Math.max(0, +document.getElementById("altRate").value || 0);
    let reduceType = document.getElementById("reduce").value;

    extra = Math.min(extra, P);
    
    // Cálculos actuales
    let pay = monthlyPayment(P, n, rate);
    let interest = pay * n - P;
    
    // Cálculos tras amortización
    let newP = P - extra;
    let feeAmt = extra * feePct / 100;
    let np, nn, newInterest;

    if (newP <= 0) {
        np = 0;
        nn = 0;
        newInterest = 0;
    } else if (reduceType === "payment") {
        nn = n;
        np = monthlyPayment(newP, nn, rate);
        newInterest = np * nn - newP;
    } else {
        np = pay;
        let lo = 1, hi = n;
        while (lo < hi) {
            let mid = Math.floor((lo + hi) / 2);
            if (monthlyPayment(newP, mid, rate) <= pay) hi = mid;
            else lo = mid + 1;
        }
        nn = lo;
        newInterest = np * nn - newP;
    }

    let saving = Math.max(0, interest - newInterest - feeAmt);

    // Actualizar interfaz
    document.getElementById("payment").textContent = euro(pay);
    document.getElementById("interest").textContent = euro(interest);
    document.getElementById("total").textContent = euro(pay * n);
    document.getElementById("newPayment").textContent = euro(np);
    document.getElementById("newTerm").textContent = nn ? `${nn} meses (${(nn / 12).toFixed(1)} años)` : "Pagada";
    document.getElementById("saving").textContent = euro(saving);
    document.getElementById("commission").textContent = euro(feeAmt);

    // Comparación
    let altInterest = (monthlyPayment(P, n, alt) * n) - P;
    document.getElementById("currentRate").textContent = euro(interest);
    document.getElementById("alternative").textContent = euro(altInterest);
    document.getElementById("difference").textContent = euro(altInterest - interest);

    // Tabla de amortización (12 meses)
    let bal = P, rows = "";
    for (let m = 1; m <= Math.min(12, n); m++) {
        let ri = bal * (rate / 100 / 12);
        let cuota = Math.min(pay, bal + ri);
        let cap = cuota - ri;
        bal = Math.max(0, bal - cap);
        rows += `<tr><td>${m}</td><td>${euro(cuota)}</td><td>${euro(ri)}</td><td>${euro(cap)}</td><td>${euro(bal)}</td></tr>`;
    }
    document.getElementById("schedule").innerHTML = rows;
}

// Función para resetear valores (ahora los deja vacíos)
function resetAll() {
    document.getElementById("capital").value = "";
    document.getElementById("months").value = "";
    document.getElementById("rate").value = "";
    document.getElementById("extra").value = "";
    document.getElementById("fee").value = "";
    document.getElementById("altRate").value = "";
    document.getElementById("reduce").value = "term";
    calc();
}

// Ejecución inicial
calc();