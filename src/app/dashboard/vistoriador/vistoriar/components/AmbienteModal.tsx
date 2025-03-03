'use client';

import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Camera, X, CheckSquare, AlertCircle, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface Item {
  id: string;
  nome: string;
  status: 'pendente' | 'em_progresso' | 'concluido';
}

interface AmbienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambiente: {
    id: string;
    nome: string;
    status: 'pendente' | 'em_progresso' | 'concluido';
    itens: Item[];
    fotos: string[];
    observacoes: string;
  };
}

export default function AmbienteModal({ isOpen, onClose, ambiente }: AmbienteModalProps) {
  const [observacao, setObservacao] = useState(ambiente.observacoes);
  const [itens, setItens] = useState<Item[]>(ambiente.itens);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Aqui você pode implementar o upload da foto
      console.log('Foto selecionada:', files[0]);
    }
  };

  const handleToggleItem = (itemId: string) => {
    setItens(itensAtuais => 
      itensAtuais.map(item => {
        if (item.id === itemId) {
          // Alterna entre pendente e concluido
          return {
            ...item,
            status: item.status === 'concluido' ? 'pendente' : 'concluido'
          };
        }
        return item;
      })
    );
  };

  const handleSaveObservacao = () => {
    // Aqui você implementará a lógica para salvar as alterações
    console.log('Salvar alterações:', {
      itens,
      observacao
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl max-h-[90vh] bg-white rounded-xl shadow-lg z-[1101] overflow-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {ambiente.nome}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="p-4">
            {/* Grid de Fotos */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Fotos do Ambiente</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ambiente.fotos.map((foto, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden">
                    <Image
                      src={foto}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                <button
                  onClick={handleAddPhoto}
                  className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <Camera className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                  <span className="text-xs text-gray-500 group-hover:text-primary">Adicionar Foto</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Itens para Verificação</h3>
              <div className="space-y-2">
                {itens.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg border ${
                      item.status === 'concluido'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      item.status === 'concluido'
                        ? 'bg-primary border-primary text-white'
                        : 'border-gray-300'
                    }`}>
                      {item.status === 'concluido' && <CheckSquare className="w-4 h-4" />}
                    </div>
                    <span className="flex-1 text-left text-sm text-gray-900">{item.nome}</span>
                    {item.status === 'pendente' && (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Observações</h3>
              <div className="space-y-3">
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Adicione observações sobre o ambiente..."
                  className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveObservacao}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 