import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

interface AcessoNegadoProps {
  mensagem?: string;
  caminhoRedirecionamento?: string;
  tempoRedirecionamento?: number;
  mostrarBotao?: boolean;
  textoBotao?: string;
}

export default function AcessoNegado({
  mensagem = 'Você não tem permissão para acessar esta página.',
  caminhoRedirecionamento = '/dashboard',
  tempoRedirecionamento = 5000,
  mostrarBotao = true,
  textoBotao = 'Voltar para o Dashboard'
}: AcessoNegadoProps) {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push(caminhoRedirecionamento);
    }, tempoRedirecionamento);
    
    return () => clearTimeout(timeoutId);
  }, [caminhoRedirecionamento, router, tempoRedirecionamento]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">
          {mensagem}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Você será redirecionado em alguns segundos...
        </p>
        {mostrarBotao && (
          <button
            onClick={() => router.push(caminhoRedirecionamento)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {textoBotao}
          </button>
        )}
      </div>
    </div>
  );
} 