'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  Activity, 
  Database,
  UserCheck,
  Map,
  Award,
  Bot,
  Settings,
  Shield,
  BarChart2,
  PieChart,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import LayoutProtegido from '@/components/layout/LayoutProtegido';
import Carregando from '@/components/ui/Carregando';
import { useLogs, LogAtividade } from '@/hooks/useLogs';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useAutorizacao } from '@/hooks/useAutorizacao';

export default function Dashboard() {
  const { logs, carregando: carregandoLogs, erro: erroLogs } = useLogs();
  const { verificarPermissao } = useAutorizacao();
  
  // Dados fictícios para os gráficos
  const dadosApoiadoresPorRegiao = [
    { regiao: 'Norte', quantidade: 320 },
    { regiao: 'Sul', quantidade: 480 },
    { regiao: 'Leste', quantidade: 280 },
    { regiao: 'Oeste', quantidade: 390 },
    { regiao: 'Centro', quantidade: 520 }
  ];
  
  const dadosDemandasPorCategoria = [
    { categoria: 'Infraestrutura', quantidade: 120 },
    { categoria: 'Saúde', quantidade: 80 },
    { categoria: 'Educação', quantidade: 60 },
    { categoria: 'Segurança', quantidade: 40 },
    { categoria: 'Outros', quantidade: 20 }
  ];
  
  // Cards de navegação
  const cardsNavegacao = [
    { 
      titulo: 'Apoiadores', 
      descricao: 'Gerenciar cadastro de apoiadores', 
      icone: <Users className="w-6 h-6 text-blue-600" />, 
      cor: 'bg-blue-50 border-blue-100', 
      link: '/apoiadores',
      estatistica: '1.250',
      detalhe: 'Crescimento de 12% no último mês'
    },
    { 
      titulo: 'Demandas', 
      descricao: 'Acompanhar demandas e solicitações', 
      icone: <FileText className="w-6 h-6 text-amber-600" />, 
      cor: 'bg-amber-50 border-amber-100', 
      link: '/demandas',
      estatistica: '320',
      detalhe: '120 pendentes, 200 concluídas'
    },
    { 
      titulo: 'Agenda Política', 
      descricao: 'Eventos e compromissos agendados', 
      icone: <Calendar className="w-6 h-6 text-green-600" />, 
      cor: 'bg-green-50 border-green-100', 
      link: '/agenda-politica',
      estatistica: '45',
      detalhe: '15 eventos nos próximos 7 dias'
    },
    { 
      titulo: 'Apoios Políticos', 
      descricao: 'Gerenciar apoios e alianças', 
      icone: <UserCheck className="w-6 h-6 text-purple-600" />, 
      cor: 'bg-purple-50 border-purple-100', 
      link: '/apoios',
      estatistica: '78',
      detalhe: '23 novos apoios este mês'
    },
    { 
      titulo: 'Regiões', 
      descricao: 'Mapeamento territorial', 
      icone: <Map className="w-6 h-6 text-indigo-600" />, 
      cor: 'bg-indigo-50 border-indigo-100', 
      link: '/regioes',
      estatistica: '15',
      detalhe: '5 regiões prioritárias'
    },
    { 
      titulo: 'Lideranças', 
      descricao: 'Gerenciar lideranças regionais', 
      icone: <Award className="w-6 h-6 text-rose-600" />, 
      cor: 'bg-rose-50 border-rose-100', 
      link: '/liderancas',
      estatistica: '42',
      detalhe: '8 novas lideranças este mês'
    },
    { 
      titulo: 'Coordenadores', 
      descricao: 'Equipe de coordenação', 
      icone: <Users className="w-6 h-6 text-cyan-600" />, 
      cor: 'bg-cyan-50 border-cyan-100', 
      link: '/coordenadores',
      estatistica: '18',
      detalhe: 'Coordenadores em 12 regiões'
    },
    { 
      titulo: 'Resultados Eleições', 
      descricao: 'Análise de resultados eleitorais', 
      icone: <BarChart2 className="w-6 h-6 text-red-600" />, 
      cor: 'bg-red-50 border-red-100', 
      link: '/resultados-eleicoes',
      estatistica: '85%',
      detalhe: 'Taxa de sucesso nas últimas eleições'
    },
    { 
      titulo: 'IA Assistente', 
      descricao: 'Assistente inteligente', 
      icone: <Bot className="w-6 h-6 text-emerald-600" />, 
      cor: 'bg-emerald-50 border-emerald-100', 
      link: '/ia',
      estatistica: '24/7',
      detalhe: 'Disponível a qualquer momento'
    },
    { 
      titulo: 'Administração', 
      descricao: 'Gerenciar usuários e permissões', 
      icone: <Shield className="w-6 h-6 text-gray-600" />, 
      cor: 'bg-gray-50 border-gray-100', 
      link: '/admin',
      estatistica: '6',
      detalhe: 'Usuários com acesso administrativo'
    },
    { 
      titulo: 'Configurações', 
      descricao: 'Configurações do sistema', 
      icone: <Settings className="w-6 h-6 text-gray-600" />, 
      cor: 'bg-gray-50 border-gray-100', 
      link: '/configuracoes',
      estatistica: '',
      detalhe: 'Personalizar sua experiência'
    }
  ];
  
  // Verificar se o usuário tem permissão para acessar um recurso
  const temPermissao = (recurso: string): boolean => {
    return verificarPermissao({
      recurso,
      acao: 'ler',
      redirecionarSeNaoAutorizado: false
    });
  };
  
  // Filtrar cards de navegação com base nas permissões do usuário
  const cardsNavegacaoFiltrados = cardsNavegacao.filter(card => {
    // Extrair o ID do recurso a partir do link
    const recursoId = card.link.split('/')[1];
    
    // Sempre mostrar o Dashboard
    if (recursoId === 'dashboard') return true;
    
    // Verificar permissão para os demais recursos
    return temPermissao(recursoId);
  });
  
  // Renderizar gráfico de barras para apoiadores por região
  const renderGraficoApoiadores = () => {
    const maximo = Math.max(...dadosApoiadoresPorRegiao.map(d => d.quantidade));
    
    return (
      <div className="mt-4">
        {dadosApoiadoresPorRegiao.map((item, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{item.regiao}</span>
              <span className="text-sm text-gray-500">{item.quantidade}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(item.quantidade / maximo) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Renderizar gráfico de pizza para demandas por categoria
  const renderGraficoDemandas = () => {
    const total = dadosDemandasPorCategoria.reduce((acc, item) => acc + item.quantidade, 0);
    const cores = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return (
      <div className="mt-4 flex flex-col items-center">
        <div className="relative w-48 h-48 mb-4">
          {dadosDemandasPorCategoria.map((item, index) => {
            const porcentagem = (item.quantidade / total) * 100;
            const angulo = (porcentagem / 100) * 360;
            const rotacao = index > 0 
              ? dadosDemandasPorCategoria
                  .slice(0, index)
                  .reduce((acc, i) => acc + (i.quantidade / total) * 360, 0) 
              : 0;
            
            return (
              <div 
                key={index}
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  background: `conic-gradient(${cores[index]} ${angulo}deg, transparent 0)`,
                  transform: `rotate(${rotacao}deg)`,
                  borderRadius: '50%',
                  clipPath: 'circle(50%)'
                }}
              ></div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-2 gap-2 w-full">
          {dadosDemandasPorCategoria.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: cores[index] }}
              ></div>
              <span className="text-xs text-gray-700">{item.categoria} ({Math.round((item.quantidade / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Renderizar ícone de ação
  const renderIconeAcao = (acao: LogAtividade['acao']) => {
    switch (acao) {
      case 'criar':
        return <span className="bg-green-100 text-green-800 p-1 rounded text-xs">Criar</span>;
      case 'editar':
        return <span className="bg-blue-100 text-blue-800 p-1 rounded text-xs">Editar</span>;
      case 'excluir':
        return <span className="bg-red-100 text-red-800 p-1 rounded text-xs">Excluir</span>;
      case 'login':
        return <span className="bg-purple-100 text-purple-800 p-1 rounded text-xs">Login</span>;
      case 'logout':
        return <span className="bg-gray-100 text-gray-800 p-1 rounded text-xs">Logout</span>;
      case 'alterar_permissao':
        return <span className="bg-indigo-100 text-indigo-800 p-1 rounded text-xs">Alterar Permissão</span>;
      case 'alterar_status':
        return <span className="bg-yellow-100 text-yellow-800 p-1 rounded text-xs">Alterar Status</span>;
      case 'alterar_perfil':
        return <span className="bg-cyan-100 text-cyan-800 p-1 rounded text-xs">Alterar Perfil</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 p-1 rounded text-xs">{acao}</span>;
    }
  };
  
  // Formatar tempo relativo
  const formatarTempoRelativo = (data: string) => {
    const dataObj = new Date(data);
    const agora = new Date();
    const diffMs = agora.getTime() - dataObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'Agora mesmo';
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diffHour < 24) {
      return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffDay < 7) {
      return `${diffDay} ${diffDay === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return format(dataObj, 'dd/MM/yyyy', { locale: ptBR });
    }
  };
  
  return (
    <LayoutProtegido>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        {/* Cards de Navegação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {cardsNavegacaoFiltrados.map((card, index) => (
            <Link 
              href={card.link} 
              key={index}
              className={`block bg-white rounded-xl border ${card.cor} shadow-sm p-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white">
                  {card.icone}
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900">{card.titulo}</h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">{card.descricao}</p>
              {card.estatistica && (
                <>
                  <div className="text-xl font-bold text-gray-900">{card.estatistica}</div>
                  <div className="text-xs text-gray-500 mt-1">{card.detalhe}</div>
                </>
              )}
            </Link>
          ))}
        </div>
        
        {/* Gráficos e Estatísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribuição de Apoiadores por Região</h3>
              <div className="bg-blue-50 p-2 rounded-lg">
                <BarChart2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            {renderGraficoApoiadores()}
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Demandas por Categoria</h3>
              <div className="bg-amber-50 p-2 rounded-lg">
                <PieChart className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            {renderGraficoDemandas()}
          </div>
        </div>
        
        {/* Atividades Recentes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
              <a href="/admin/logs" className="text-sm text-primary hover:text-primary-dark">
                Ver todas
              </a>
            </div>
          </div>
          
          <div>
            {carregandoLogs ? (
              <div className="p-8 flex justify-center">
                <Carregando tamanhoCompleto={false} mensagem="Carregando atividades..." />
              </div>
            ) : erroLogs ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{erroLogs}</p>
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                  Tentar novamente
                </button>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">Nenhuma atividade registrada</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {logs.slice(0, 5).map((log) => (
                  <li key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Database className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {log.usuarioNome}
                              </span>
                              {renderIconeAcao(log.acao)}
                              <span className="text-sm text-gray-600 capitalize">
                                {log.recurso}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {log.detalhes}
                            </p>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {formatarTempoRelativo(log.data)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </LayoutProtegido>
  );
} 