'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Coordenador, Municipio, Regiao } from '@/types/mapa';

interface UseMapaRegioesReturn {
  regioes: Regiao[];
  municipios: Municipio[];
  coordenadores: Coordenador[];
  loading: boolean;
  error: string | null;
  atualizarCorRegiao: (id: string, cor: string) => Promise<void>;
  atualizarCoordenadorRegiao: (regiaoId: string, coordenadorId: string | null) => Promise<void>;
}

export function useMapaRegioes(): UseMapaRegioesReturn {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [coordenadores, setCoordenadores] = useState<Coordenador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setError(null);

        // Carregar coordenadores
        const { data: coordenadoresData, error: coordenadoresError } = await supabase
          .from('coordenadores')
          .select('*')
          .order('nome');

        if (coordenadoresError) throw new Error(`Erro ao carregar coordenadores: ${coordenadoresError.message}`);
        
        // Carregar regiões
        const { data: regioesData, error: regioesError } = await supabase
          .from('regioes')
          .select('*')
          .order('nome');

        if (regioesError) throw new Error(`Erro ao carregar regiões: ${regioesError.message}`);
        
        // Carregar municípios
        const { data: municipiosData, error: municipiosError } = await supabase
          .from('municipios')
          .select('*')
          .order('nome');

        if (municipiosError) throw new Error(`Erro ao carregar municípios: ${municipiosError.message}`);

        // Transformar dados para o formato esperado pela aplicação
        const regioesFormatadas: Regiao[] = regioesData.map(regiao => ({
          id: regiao.id,
          nome: regiao.nome,
          cor: regiao.cor,
          coordenadorId: regiao.coordenador_id,
          municipios: regiao.municipios || []
        }));

        const municipiosFormatados: Municipio[] = municipiosData.map(municipio => ({
          id: municipio.id,
          nome: municipio.nome,
          regiaoId: municipio.regiao_id,
          populacao: municipio.populacao,
          area: municipio.area,
          geometry: municipio.coordenadas
        }));

        const coordenadoresFormatados: Coordenador[] = coordenadoresData.map(coordenador => ({
          id: coordenador.id,
          nome: coordenador.nome,
          email: coordenador.email,
          telefone: coordenador.telefone
        }));

        setRegioes(regioesFormatadas);
        setMunicipios(municipiosFormatados);
        setCoordenadores(coordenadoresFormatados);
      } catch (err) {
        console.error('Erro ao carregar dados do mapa:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  // Função para atualizar a cor de uma região
  const atualizarCorRegiao = async (id: string, cor: string) => {
    try {
      const { error } = await supabase
        .from('regioes')
        .update({ cor })
        .eq('id', id);

      if (error) throw new Error(`Erro ao atualizar cor: ${error.message}`);

      // Atualizar estado local
      setRegioes(regioes.map(regiao => 
        regiao.id === id ? { ...regiao, cor } : regiao
      ));
    } catch (err) {
      console.error('Erro ao atualizar cor da região:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao atualizar cor');
      throw err;
    }
  };

  // Função para atualizar o coordenador de uma região
  const atualizarCoordenadorRegiao = async (regiaoId: string, coordenadorId: string | null) => {
    try {
      const { error } = await supabase
        .from('regioes')
        .update({ coordenador_id: coordenadorId })
        .eq('id', regiaoId);

      if (error) throw new Error(`Erro ao atualizar coordenador: ${error.message}`);

      // Atualizar estado local
      setRegioes(regioes.map(regiao => 
        regiao.id === regiaoId ? { ...regiao, coordenadorId } : regiao
      ));
    } catch (err) {
      console.error('Erro ao atualizar coordenador da região:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao atualizar coordenador');
      throw err;
    }
  };

  return {
    regioes,
    municipios,
    coordenadores,
    loading,
    error,
    atualizarCorRegiao,
    atualizarCoordenadorRegiao
  };
}

export default useMapaRegioes; 