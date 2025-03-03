import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface NovoUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  perfis: { id: string; nome: string }[];
  onSave: (dadosUsuario: {
    nome: string;
    email: string;
    perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  }) => Promise<boolean>;
}

export default function NovoUsuarioModal({
  isOpen,
  onClose,
  perfis,
  onSave
}: NovoUsuarioModalProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador'>('apoiador');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<{
    nome?: string;
    email?: string;
  }>({});

  if (!isOpen) return null;

  const validarFormulario = (): boolean => {
    const novosErros: { nome?: string; email?: string } = {};
    
    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }
    
    if (!email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = 'Email inválido';
    }
    
    setErrosValidacao(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSave = async () => {
    if (!validarFormulario()) return;
    
    setSalvando(true);
    setErro(null);
    setSucesso(false);
    
    try {
      const resultado = await onSave({
        nome,
        email,
        perfil
      });
      
      if (resultado) {
        setSucesso(true);
        // Limpar formulário
        setNome('');
        setEmail('');
        setPerfil('apoiador');
        
        setTimeout(() => {
          onClose();
          setSucesso(false);
        }, 1500);
      } else {
        setErro('Não foi possível criar o usuário');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setErro('Ocorreu um erro ao criar o usuário');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Adicionar Novo Usuário
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
                <p className="font-medium">Informações importantes</p>
                <p className="mt-1">
                  • Uma senha temporária será gerada e enviada para o email do usuário.
                  <br />
                  • O usuário precisará alterar a senha no primeiro acesso.
                  <br />
                  • As permissões serão definidas automaticamente com base no perfil selecionado.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={`w-full p-2 border rounded-lg ${
                  errosValidacao.nome ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Digite o nome completo"
              />
              {errosValidacao.nome && (
                <p className="mt-1 text-xs text-red-500">{errosValidacao.nome}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-2 border rounded-lg ${
                  errosValidacao.email ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Digite o email"
              />
              {errosValidacao.email && (
                <p className="mt-1 text-xs text-red-500">{errosValidacao.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="perfil" className="block text-sm font-medium text-gray-700 mb-1">
                Perfil <span className="text-red-500">*</span>
              </label>
              <select
                id="perfil"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value as any)}
                className="w-full p-2 border border-gray-200 rounded-lg"
              >
                {perfis.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                O perfil determina as permissões iniciais do usuário.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            {sucesso && <p className="text-sm text-green-600">Usuário criado com sucesso!</p>}
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
              {salvando ? 'Salvando...' : 'Criar Usuário'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 