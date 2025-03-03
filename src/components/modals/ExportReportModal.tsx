'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Download, FileSpreadsheet, FileType } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  filename: string;
  headers?: Record<string, string>;
}

export default function ExportReportModal({
  isOpen,
  onClose,
  title,
  data,
  filename,
  headers
}: ExportReportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    setIsExporting(true);

    try {
      switch (selectedFormat) {
        case 'csv':
          exportToCSV(data, filename, headers);
          break;
        case 'excel':
          exportToExcel(data, filename, headers);
          break;
        case 'pdf':
          exportToPDF(data, filename, title, headers);
          break;
      }
      
      // Fechar o modal após um breve delay para dar tempo de iniciar o download
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Ocorreu um erro ao exportar o relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-xl shadow-lg z-[9999]">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Exportar Relatório
            </Dialog.Title>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </Dialog.Close>
          </div>

          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              Selecione o formato desejado para exportar o relatório de {title.toLowerCase()}.
            </p>

            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={selectedFormat === 'excel'}
                  onChange={() => setSelectedFormat('excel')}
                  className="mr-3"
                />
                <FileSpreadsheet className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Excel (.xlsx)</p>
                  <p className="text-xs text-gray-500">Planilha compatível com Microsoft Excel</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={selectedFormat === 'csv'}
                  onChange={() => setSelectedFormat('csv')}
                  className="mr-3"
                />
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">CSV (.csv)</p>
                  <p className="text-xs text-gray-500">Valores separados por vírgula, compatível com qualquer planilha</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={selectedFormat === 'pdf'}
                  onChange={() => setSelectedFormat('pdf')}
                  className="mr-3"
                />
                <FileType className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">PDF (.pdf)</p>
                  <p className="text-xs text-gray-500">Documento em formato de leitura</p>
                </div>
              </label>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <Dialog.Close className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              Cancelar
            </Dialog.Close>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Exportar
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 