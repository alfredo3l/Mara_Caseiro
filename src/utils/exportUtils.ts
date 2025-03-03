/**
 * Utilitários para exportação de dados em diferentes formatos
 */

/**
 * Converte um array de objetos para CSV
 * @param data Array de objetos a serem convertidos
 * @param headers Cabeçalhos personalizados (opcional)
 * @returns String no formato CSV
 */
export function convertToCSV(data: any[], headers?: Record<string, string>) {
  if (!data || !data.length) return '';

  // Obter as chaves do primeiro objeto para usar como cabeçalhos
  const keys = Object.keys(data[0]);
  
  // Criar a linha de cabeçalho
  let csvContent = '';
  if (headers) {
    csvContent = keys.map(key => headers[key] || key).join(',') + '\n';
  } else {
    csvContent = keys.join(',') + '\n';
  }

  // Adicionar as linhas de dados
  data.forEach(item => {
    const values = keys.map(key => {
      const value = item[key];
      // Escapar aspas e adicionar aspas em volta de strings que contêm vírgulas
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      return value !== undefined && value !== null ? value : '';
    });
    csvContent += values.join(',') + '\n';
  });

  return csvContent;
}

/**
 * Exporta dados para um arquivo CSV
 * @param data Array de objetos a serem exportados
 * @param filename Nome do arquivo (sem extensão)
 * @param headers Cabeçalhos personalizados (opcional)
 */
export function exportToCSV(data: any[], filename: string, headers?: Record<string, string>) {
  const csvContent = convertToCSV(data, headers);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Exporta dados para um arquivo Excel (XLSX)
 * Nota: Esta é uma implementação simplificada que usa CSV.
 * Para uma implementação completa, seria necessário usar uma biblioteca como xlsx ou exceljs.
 * @param data Array de objetos a serem exportados
 * @param filename Nome do arquivo (sem extensão)
 * @param headers Cabeçalhos personalizados (opcional)
 */
export function exportToExcel(data: any[], filename: string, headers?: Record<string, string>) {
  const csvContent = convertToCSV(data, headers);
  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${filename}.xlsx`);
}

/**
 * Exporta dados para um arquivo PDF
 * Nota: Esta é uma implementação simplificada que redireciona para uma página de impressão.
 * Para uma implementação completa, seria necessário usar uma biblioteca como jsPDF ou pdfmake.
 * @param data Array de objetos a serem exportados
 * @param filename Nome do arquivo (sem extensão)
 * @param title Título do relatório
 * @param headers Cabeçalhos personalizados (opcional)
 */
export function exportToPDF(data: any[], filename: string, title: string, headers?: Record<string, string>) {
  // Criar uma nova janela para impressão
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita popups para esta página para exportar o PDF.');
    return;
  }

  // Obter as chaves do primeiro objeto para usar como cabeçalhos
  const keys = Object.keys(data[0]);
  
  // Criar o conteúdo HTML
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print()">Imprimir PDF</button>
      <h1>${title}</h1>
      <table>
        <thead>
          <tr>
  `;

  // Adicionar cabeçalhos
  keys.forEach(key => {
    const headerText = headers ? (headers[key] || key) : key;
    htmlContent += `<th>${headerText}</th>`;
  });

  htmlContent += `
          </tr>
        </thead>
        <tbody>
  `;

  // Adicionar linhas de dados
  data.forEach(item => {
    htmlContent += '<tr>';
    keys.forEach(key => {
      const value = item[key] !== undefined && item[key] !== null ? item[key] : '';
      htmlContent += `<td>${value}</td>`;
    });
    htmlContent += '</tr>';
  });

  htmlContent += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Escrever o conteúdo HTML na nova janela
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Função auxiliar para download de blobs
 * @param blob Blob a ser baixado
 * @param filename Nome do arquivo
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
} 