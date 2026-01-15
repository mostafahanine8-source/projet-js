(() => {
  "use strict";

  function exportCSV(filename, rows) {
    if (!rows || rows.length === 0) return;

    const cols = Object.keys(rows[0]);
    const lines = [cols.join(",")];

    rows.forEach(r => {
      const line = cols.map(c => {
        const val = r[c] ?? "";
        const s = String(val).replaceAll('"', '""');
        return `"${s}"`;
      }).join(",");
      lines.push(line);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function exportPDF(title, kvPairs) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, margin, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60);

    kvPairs.forEach(([k, v]) => {
      y += 18;
      if (y > 760) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", "bold");
      doc.text(String(k), margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(v ?? ""), margin + 160, y);
    });

    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  }

  EO.ui = EO.ui || {};
  EO.ui.exports = { exportCSV, exportPDF };
})();
