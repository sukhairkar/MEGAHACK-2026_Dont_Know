const form = document.getElementById('form');
const output = document.getElementById('output');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {};
    new FormData(form).forEach((v, k) => data[k] = v);

    output.value = "Generating statement...";
    const btn = form.querySelector('button');
    btn.disabled = true;

    try {
        const res = await fetch("http://127.0.0.1:8000/generate-statement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const json = await res.json();
        output.value = json.statement;
        
        // Enable PDF download button
        const dlBtn = document.getElementById('download-btn');
        dlBtn.disabled = false;
        dlBtn.style.background = "var(--primary)";
    } catch (err) {
        output.value = "Error generating statement: " + err;
    } finally {
        btn.disabled = false;
    }
});

document.getElementById('download-btn').addEventListener('click', () => {
    const element = document.getElementById('output');
    const opt = {
        margin:       1,
        filename:     'FIR_Statement.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // New window/element to fix styling for PDF
    const printArea = document.createElement('div');
    printArea.style.padding = '40px';
    printArea.style.color = '#000';
    printArea.style.whiteSpace = 'pre-wrap';
    printArea.style.fontFamily = "'Inter', sans-serif";
    printArea.innerText = element.value;

    html2pdf().set(opt).from(printArea).save();
});