// custom.js
// Заполнение и скачивание документов на основе шаблонов (.pdf и .docx)
// Требуются библиотеки в HTML:
// <script src="https://unpkg.com/pdf-lib/dist/pdf-lib.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pizzip/3.1.6/pizzip.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/docxtemplater/3.21.1/docxtemplater.min.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('doc-form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fio = form.fio.value.trim();
      const country = form.country.value.trim();
      const city = form.city.value.trim();
      const phone = form.phone.value.trim();
      const doctype = form.doctype.value;
  
      if (doctype === 'pdf') {
        // PDF: загружаем шаблон из папки assets
        const url = 'assets/template.pdf';
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
        const { PDFDocument, StandardFonts, rgb } = PDFLib;
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        firstPage.drawText(`ФИО: ${fio}`, { x: 50, y: 700, size: 12, font, color: rgb(0,0,0) });
        firstPage.drawText(`Страна: ${country}`, { x: 50, y: 680, size: 12, font, color: rgb(0,0,0) });
        firstPage.drawText(`Город: ${city}`, { x: 50, y: 660, size: 12, font, color: rgb(0,0,0) });
        firstPage.drawText(`Телефон: ${phone}`, { x: 50, y: 640, size: 12, font, color: rgb(0,0,0) });
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fio}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
  
      } else if (doctype === 'docx') {
        // DOCX: загружаем шаблон из папки assets
        const url = 'assets/template.docx';
        const content = await fetch(url).then(res => res.arrayBuffer());
        const zip = new PizZip(content);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        doc.setData({ fio, country, city, phone });
        try { doc.render(); } catch (error) { console.error(error); }
        const out = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(out);
        link.download = `${fio}.docx`;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    });
  });
  