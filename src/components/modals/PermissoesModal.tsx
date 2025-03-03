'use client';

import { useState, useEffect } from 'react';
import { X, Save, Check, AlertCircle } from 'lucide-react';

interface Recurso {
  id: string;
  nome: string;
}

interface PermissaoUsuario {
  usuarioId: string;
  nome: string;
  email: string;
  perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  status: 'ativo' | 'inativo' | 'pendente';
  permissoes: {
    recurso: string;
    acoes: ('ler' | 'criar' | 'editar' | 'excluir')[];
  }[];
}

interface PermissoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: PermissaoUsuario | null;
  recursos: Recurso[];
  onSave: (
    usuarioId: string,
    permissoes: {
      recurso: string;
      acoes: ('ler' | 'criar' | 'editar' | 'excluir')[];
    }[]
  ) => Promise<boolean>;
}

export default function PermissoesModal({
  isOpen,
  onClose,
  usuario,
  recursos,
  onSave
}: PermissoesModalProps) {
  const [permissoes, setPermissoes] = useState<{
    recurso: string;
    acoes: ('ler' | 'criar' | 'editar' | 'excluir')[];
  }[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (usuario) {
      setPermissoes(usuario.permissoes);
    }
  }, [usuario]);

  if (!isOpen || !usuario) return null;

  const handleToggleAcao = (recursoId: string, acao: 'ler' | 'criar' | 'editar' | 'excluir') => {
    setPermissoes(prevPermissoes => {
      return prevPermissoes.map(permissao => {
        if (permissao.recurso === recursoId) {
          // Se a ação já existe, remover
          if (permissao.acoes.includes(acao)) {
            // Não permitir remover a ação 'ler' se outras ações estiverem presentes
            if (acao === 'ler' && permissao.acoes.some(a => a !== 'ler')) {
              return permissao;
            }
            return {
              ...permissao,
              acoes: permissao.acoes.filter(a => a !== acao)
            };
          } 
          // Se a ação não existe, adicionar
          else {
            // Se estiver adicionando qualquer ação que não seja 'ler', garantir que 'ler' também esteja presente
            let novasAcoes = [...permissao.acoes, acao];
            if (acao !== 'ler' && !permissao.acoes.includes('ler')) {
              novasAcoes.push('ler');
            }
            return {
              ...permissao,
              acoes: novasAcoes
            };
          }
        }
        return permissao;
      });
    });
  };

  const handleSave = async () => {
    if (!usuario) return;
    
    setSalvando(true);
    setErro(null);
    setSucesso(false);
    
    try {
      const resultado = await onSave(usuario.usuarioId, permissoes);
      
      if (resultado) {
        setSucesso(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErro('Não foi possível salvar as permissões');
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      setErro('Ocorreu um erro ao salvar as permissões');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Permissões de Acesso - {usuario.nome}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Informações sobre permissões</p>
                <p className="mt-1">
                  • Usuários com perfil <strong>Super Administrador</strong> têm acesso total ao sistema.
                  <br />
                  • A permissão <strong>Ler</strong> é necessária para acessar qualquer recurso.
                  <br />
                  • As permissões <strong>Criar</strong>, <strong>Editar</strong> e <strong>Excluir</strong> requerem a permissão <strong>Ler</strong>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 w-1/4">Recurso</th>
                  <th className="text-center p-3 border-b border-gray-200 font-medium text-gray-700">Ler</th>
                  <th className="text-center p-3 border-b border-gray-200 font-medium text-gray-700">Criar</th>
                  <th className="text-center p-3 border-b border-gray-200 font-medium text-gray-700">Editar</th>
                  <th className="text-center p-3 border-b border-gray-200 font-medium text-gray-700">Excluir</th>
                </tr>
              </thead>
              <tbody>
                {recursos.map(recurso => {
                  const permissaoRecurso = permissoes.find(p => p.recurso === recurso.id) || { recurso: recurso.id, acoes: [] };
                  
                  return (
                    <tr key={recurso.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 text-gray-800 font-medium">{recurso.nome}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleAcao(recurso.id, 'ler')}
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            permissaoRecurso.acoes.includes('ler')
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          aria-label={`${permissaoRecurso.acoes.includes('ler') ? 'Remover' : 'Adicionar'} permissão de leitura para ${recurso.nome}`}
                        >
                          {permissaoRecurso.acoes.includes('ler') && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleAcao(recurso.id, 'criar')}
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            permissaoRecurso.acoes.includes('criar')
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          aria-label={`${permissaoRecurso.acoes.includes('criar') ? 'Remover' : 'Adicionar'} permissão de criação para ${recurso.nome}`}
                        >
                          {permissaoRecurso.acoes.includes('criar') && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleAcao(recurso.id, 'editar')}
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            permissaoRecurso.acoes.includes('editar')
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          aria-label={`${permissaoRecurso.acoes.includes('editar') ? 'Remover' : 'Adicionar'} permissão de edição para ${recurso.nome}`}
                        >
                          {permissaoRecurso.acoes.includes('editar') && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleAcao(recurso.id, 'excluir')}
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            permissaoRecurso.acoes.includes('excluir')
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          aria-label={`${permissaoRecurso.acoes.includes('excluir') ? 'Remover' : 'Adicionar'} permissão de exclusão para ${recurso.nome}`}
                        >
                          {permissaoRecurso.acoes.includes('excluir') && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            {sucesso && <p className="text-sm text-green-600">Permissões salvas com sucesso!</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={salvando}
              className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 ${
                salvando ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-4 h-4" />
              {salvando ? 'Salvando...' : 'Salvar Permissões'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 