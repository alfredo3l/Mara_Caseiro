import { Loader2 } from 'lucide-react';

interface CarregandoProps {
  mensagem?: string;
  tamanhoCompleto?: boolean;
  tipo?: 'spinner' | 'skeleton';
}

export default function Carregando({
  mensagem = 'Carregando...',
  tamanhoCompleto = true,
  tipo = 'spinner'
}: CarregandoProps) {
  if (tipo === 'skeleton') {
    return (
      <div className={`${tamanhoCompleto ? 'min-h-screen' : 'min-h-[200px]'} bg-[#f8fafc] flex items-center justify-center`}>
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${tamanhoCompleto ? 'min-h-screen' : 'min-h-[200px]'} bg-[#f8fafc] flex flex-col items-center justify-center`}>
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      {mensagem && <p className="text-gray-600">{mensagem}</p>}
    </div>
  );
} 