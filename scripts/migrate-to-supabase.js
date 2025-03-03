/**
 * Script para migrar dados dos arquivos GeoJSON para o Supabase
 * 
 * Este script lê os arquivos GeoJSON de municípios e regiões e os insere no Supabase.
 * 
 * Uso:
 * 1. Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY
 * 2. Execute o script com: node scripts/migrate-to-supabase.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use a chave de serviço para ter permissões completas

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY devem ser definidas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Caminhos para os arquivos GeoJSON
const municipiosPath = path.join(__dirname, '../public/data/municipios_ms.json');
const regioesPath = path.join(__dirname, '../public/data/ms_regioes.json');

// Função principal
async function migrarDados() {
  try {
    console.log('Iniciando migração de dados para o Supabase...');
    
    // Limpar tabelas existentes (opcional - remova se não quiser limpar os dados)
    console.log('Limpando tabelas existentes...');
    await supabase.from('municipios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('regioes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('coordenadores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Inserir coordenadores
    console.log('Inserindo coordenadores...');
    const coordenadores = [
      { nome: 'João Silva', email: 'joao.silva@exemplo.com', telefone: '(67) 99999-1111' },
      { nome: 'Maria Oliveira', email: 'maria.oliveira@exemplo.com', telefone: '(67) 99999-2222' },
      { nome: 'Pedro Santos', email: 'pedro.santos@exemplo.com', telefone: '(67) 99999-3333' },
      { nome: 'Ana Souza', email: 'ana.souza@exemplo.com', telefone: '(67) 99999-4444' }
    ];
    
    const { data: coordenadoresInseridos, error: errorCoordenadores } = await supabase
      .from('coordenadores')
      .insert(coordenadores)
      .select();
      
    if (errorCoordenadores) {
      throw new Error(`Erro ao inserir coordenadores: ${errorCoordenadores.message}`);
    }
    
    console.log(`${coordenadoresInseridos.length} coordenadores inseridos com sucesso.`);
    
    // Mapear IDs de coordenadores para uso posterior
    const coordenadoresMap = {};
    coordenadoresInseridos.forEach((coord, index) => {
      coordenadoresMap[index] = coord.id;
    });
    
    // Ler e processar regiões
    console.log('Processando regiões...');
    const regioesData = JSON.parse(fs.readFileSync(regioesPath, 'utf8'));
    
    const regioes = regioesData.regioes.map((regiao, index) => ({
      nome: regiao.nome,
      cor: regiao.cor || '#CCCCCC',
      coordenador_id: coordenadoresMap[index % coordenadoresInseridos.length], // Distribuir coordenadores
      municipios: [] // Será preenchido depois
    }));
    
    const { data: regioesInseridas, error: errorRegioes } = await supabase
      .from('regioes')
      .insert(regioes)
      .select();
      
    if (errorRegioes) {
      throw new Error(`Erro ao inserir regiões: ${errorRegioes.message}`);
    }
    
    console.log(`${regioesInseridas.length} regiões inseridas com sucesso.`);
    
    // Mapear IDs de regiões para uso posterior
    const regioesMap = {};
    regioesInseridas.forEach((regiao) => {
      regioesMap[regiao.nome] = regiao.id;
    });
    
    // Ler e processar municípios
    console.log('Processando municípios...');
    const municipiosData = JSON.parse(fs.readFileSync(municipiosPath, 'utf8'));
    
    // Verificar se é uma FeatureCollection
    const features = municipiosData.type === 'FeatureCollection' 
      ? municipiosData.features 
      : [municipiosData];
    
    const municipios = features.map(feature => {
      const props = feature.properties;
      const regiaoId = regioesMap[props.regiao] || regioesInseridas[0].id;
      
      return {
        nome: props.nome,
        regiao_id: regiaoId,
        populacao: props.populacao || 0,
        area: props.area || 0,
        coordenadas: feature.geometry
      };
    });
    
    // Inserir municípios em lotes para evitar problemas com limites de tamanho
    const BATCH_SIZE = 20;
    for (let i = 0; i < municipios.length; i += BATCH_SIZE) {
      const batch = municipios.slice(i, i + BATCH_SIZE);
      const { data: municipiosInseridos, error: errorMunicipios } = await supabase
        .from('municipios')
        .insert(batch)
        .select();
        
      if (errorMunicipios) {
        throw new Error(`Erro ao inserir lote de municípios: ${errorMunicipios.message}`);
      }
      
      console.log(`Lote de ${municipiosInseridos.length} municípios inserido com sucesso.`);
      
      // Atualizar o array de municípios em cada região
      for (const municipio of municipiosInseridos) {
        await supabase
          .from('regioes')
          .update({
            municipios: supabase.sql`array_append(municipios, ${municipio.id})`
          })
          .eq('id', municipio.regiao_id);
      }
    }
    
    console.log('Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar a função principal
migrarDados(); 