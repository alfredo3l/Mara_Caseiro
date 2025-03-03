import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Mensagem {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface Conversa {
  id: string;
  titulo: string;
  mensagens: Mensagem[];
  dataCriacao: string;
  dataAtualizacao: string;
  usuarioId: string;
  organizacaoId: string;
}

export function useIA() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversaAtual, setConversaAtual] = useState<Conversa | null>(null);
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

  // ID de usuário simulado para desenvolvimento
  const usuarioIdSimulado = '123e4567-e89b-12d3-a456-426614174000';
  const organizacaoIdSimulada = '123e4567-e89b-12d3-a456-426614174001';

  const fetchConversas = async () => {
    try {
      setLoading(true);
      
      // Usando ID de usuário simulado para desenvolvimento
      const result = await supabase
        .from('conversas_ia')
        .select('*')
        .eq('usuarioId', usuarioIdSimulado)
        .order('dataAtualizacao', { ascending: false });
      
      const { data, error } = result;
      
      if (error) throw error;
      
      setConversas(data as Conversa[]);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar conversas:', err);
      setError('Falha ao carregar conversas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMensagens = async (conversaId: string) => {
    try {
      setLoading(true);
      
      const result = await supabase
        .from('conversas_ia')
        .select('mensagens')
        .eq('id', conversaId)
        .single();
      
      const { data, error } = result;
      
      if (error) throw error;
      
      setMensagens(data.mensagens || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      setError('Falha ao carregar mensagens. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const criarConversacao = async (titulo: string) => {
    try {
      setLoading(true);
      
      const agora = new Date().toISOString();
      const novaConversa = {
        titulo,
        mensagens: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em estratégia política e campanhas eleitorais. Ajude o usuário com dicas, análises e sugestões para melhorar sua campanha política.'
          }
        ],
        dataCriacao: agora,
        dataAtualizacao: agora,
        usuarioId: usuarioIdSimulado,
        organizacaoId: organizacaoIdSimulada
      };
      
      const result = await supabase
        .from('conversas_ia')
        .insert([novaConversa])
        .select();
      
      const { data, error } = result;
      
      if (error) throw error;
      
      const conversaCriada = data[0] as Conversa;
      
      // Atualizar a lista de conversas
      setConversas(prev => [conversaCriada, ...prev]);
      
      return conversaCriada;
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
      setError('Falha ao criar conversa. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getConversaById = async (id: string) => {
    try {
      setLoading(true);
      
      const result = await supabase
        .from('conversas_ia')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = result;
      
      if (error) throw error;
      
      setConversaAtual(data as Conversa);
      return data as Conversa;
    } catch (err) {
      console.error('Erro ao buscar conversa:', err);
      setError('Falha ao carregar conversa. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const criarNovaConversa = async (usuarioId: string, organizacaoId: string, mensagemInicial?: string) => {
    try {
      setLoading(true);
      
      const agora = new Date().toISOString();
      const novaConversa: Omit<Conversa, 'id'> = {
        titulo: 'Nova conversa',
        mensagens: mensagemInicial 
          ? [
              {
                role: 'system',
                content: 'Você é um assistente especializado em estratégia política e campanhas eleitorais. Ajude o usuário com dicas, análises e sugestões para melhorar sua campanha política.'
              },
              {
                role: 'user',
                content: mensagemInicial,
                timestamp: agora
              }
            ]
          : [
              {
                role: 'system',
                content: 'Você é um assistente especializado em estratégia política e campanhas eleitorais. Ajude o usuário com dicas, análises e sugestões para melhorar sua campanha política.'
              }
            ],
        dataCriacao: agora,
        dataAtualizacao: agora,
        usuarioId,
        organizacaoId
      };
      
      const { data, error } = await supabase
        .from('conversas_ia')
        .insert([novaConversa])
        .select();
      
      if (error) throw error;
      
      const conversaCriada = data[0] as Conversa;
      setConversaAtual(conversaCriada);
      
      // Se houver mensagem inicial, enviar para a API
      if (mensagemInicial) {
        await enviarMensagemParaAPI(conversaCriada.id, mensagemInicial);
      }
      
      return conversaCriada;
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
      setError('Falha ao criar conversa. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async (conversaId: string, mensagem: string) => {
    try {
      setLoading(true);
      
      // Primeiro, buscar a conversa atual
      const resultBusca = await supabase
        .from('conversas_ia')
        .select('*')
        .eq('id', conversaId)
        .single();
      
      const { data: conversaAtual, error: errorBusca } = resultBusca;
      
      if (errorBusca) throw errorBusca;
      
      // Adicionar a mensagem do usuário
      const agora = new Date().toISOString();
      const novaMensagem: Mensagem = {
        role: 'user',
        content: mensagem,
        timestamp: agora
      };
      
      const mensagens = [...conversaAtual.mensagens, novaMensagem];
      
      // Atualizar a conversa
      const resultUpdate = await supabase
        .from('conversas_ia')
        .update({ 
          mensagens,
          dataAtualizacao: agora,
          titulo: mensagens.length <= 3 ? mensagem.substring(0, 30) + (mensagem.length > 30 ? '...' : '') : conversaAtual.titulo
        })
        .eq('id', conversaId);
      
      const { error: errorUpdate } = resultUpdate;
      
      if (errorUpdate) throw errorUpdate;
      
      // Enviar para a API
      return await enviarMensagemParaAPI(conversaId, mensagem);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Falha ao enviar mensagem. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagemParaAPI = async (conversaId: string, mensagem: string) => {
    try {
      setLoading(true);
      
      // Buscar a conversa atualizada
      const resultBusca = await supabase
        .from('conversas_ia')
        .select('*')
        .eq('id', conversaId)
        .single();
      
      const { data: conversaAtual, error: errorBusca } = resultBusca;
      
      if (errorBusca) throw errorBusca;
      
      // Verificar limites de uso
      const resultOrg = await supabase
        .from('organizacoes')
        .select('limites')
        .eq('id', conversaAtual.organizacaoId)
        .single();
      
      const { data: organizacao, error: errorOrg } = resultOrg;
      
      if (errorOrg) throw errorOrg;
      
      // Contar consultas do dia
      const hoje = new Date().toISOString().split('T')[0];
      const resultCount = await supabase
        .from('conversas_ia')
        .select('id', { count: 'exact' })
        .eq('organizacaoId', conversaAtual.organizacaoId)
        .gte('dataAtualizacao', hoje);
      
      const { count, error: errorCount } = resultCount;
      
      if (errorCount) throw errorCount;
      
      if (count !== null && count >= organizacao.limites.consultasIA) {
        throw new Error('Limite diário de consultas à IA atingido. Entre em contato com o administrador.');
      }
      
      // Preparar mensagens para a API
      const mensagensParaAPI = conversaAtual.mensagens.map((m: Mensagem) => ({
        role: m.role,
        content: m.content
      }));
      
      // Chamar a API da OpenAI (simulado aqui)
      // Na implementação real, você usaria fetch ou axios para chamar a API
      const respostaIA = await simulaRespostaOpenAI(mensagensParaAPI);
      
      // Adicionar a resposta da IA
      const agora = new Date().toISOString();
      const novaResposta: Mensagem = {
        role: 'assistant',
        content: respostaIA,
        timestamp: agora
      };
      
      const mensagensAtualizadas = [...conversaAtual.mensagens, novaResposta];
      
      // Atualizar a conversa
      const resultUpdate = await supabase
        .from('conversas_ia')
        .update({ 
          mensagens: mensagensAtualizadas,
          dataAtualizacao: agora
        })
        .eq('id', conversaId)
        .select();
      
      const { data, error: errorUpdate } = resultUpdate;
      
      if (errorUpdate) throw errorUpdate;
      
      setConversaAtual(data[0] as Conversa);
      return data[0] as Conversa;
    } catch (err: unknown) {
      console.error('Erro ao processar mensagem com IA:', err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao processar mensagem com IA. Tente novamente.';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Função simulada - na implementação real, seria uma chamada à API da OpenAI
  const simulaRespostaOpenAI = async (mensagens: { role: string; content: string }[]) => {
    // Simular um tempo de resposta
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const ultimaMensagem = mensagens.filter(m => m.role === 'user').pop()?.content || '';
    
    if (ultimaMensagem.toLowerCase().includes('estratégia')) {
      return 'Para uma estratégia política eficaz, é importante focar em três pilares: 1) Conhecer bem seu eleitorado e suas necessidades; 2) Desenvolver uma mensagem clara e consistente; 3) Utilizar os canais de comunicação adequados para cada segmento do eleitorado. Recomendo começar com uma pesquisa detalhada da região e criar um plano de comunicação segmentado.';
    } else if (ultimaMensagem.toLowerCase().includes('discurso')) {
      return 'Um bom discurso político deve ser autêntico, conciso e conectado às necessidades do eleitorado. Estruture em três partes: 1) Apresente o problema que afeta os eleitores; 2) Explique sua proposta de solução; 3) Conclua com um chamado à ação. Use linguagem simples, histórias pessoais e dados concretos para fortalecer seus argumentos.';
    } else if (ultimaMensagem.toLowerCase().includes('redes sociais')) {
      return 'Para uma estratégia eficaz em redes sociais, recomendo: 1) Defina personas para cada plataforma; 2) Crie conteúdo nativo para cada rede; 3) Mantenha consistência visual e de mensagem; 4) Interaja ativamente com seguidores; 5) Use vídeos curtos e imagens de alta qualidade; 6) Estabeleça um calendário de postagens; 7) Monitore métricas e ajuste a estratégia conforme necessário.';
    } else {
      return 'Como especialista em estratégia política, posso ajudá-lo com dicas para sua campanha, elaboração de discursos, estratégias de comunicação, análise de dados eleitorais e muito mais. Qual aspecto específico da sua campanha política você gostaria de melhorar?';
    }
  };

  const excluirConversa = async (id: string) => {
    try {
      setLoading(true);
      
      const result = await supabase
        .from('conversas_ia')
        .delete()
        .eq('id', id);
      
      const { error } = result;
      
      if (error) throw error;
      
      // Atualizar a lista de conversas
      setConversas(conversas.filter(c => c.id !== id));
      
      if (conversaAtual?.id === id) {
        setConversaAtual(null);
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao excluir conversa:', err);
      setError('Falha ao excluir conversa. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    conversas,
    mensagens,
    loading,
    error,
    fetchConversas,
    fetchMensagens,
    criarConversacao,
    enviarMensagem,
    excluirConversa
  };
} 