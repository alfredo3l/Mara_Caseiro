/**
 * Script para verificar os buckets necessários no Supabase
 * 
 * Execute este script com:
 * node scripts/create-buckets.js
 * 
 * NOTA: Para criar buckets, você precisa da chave de serviço do Supabase (SUPABASE_SERVICE_ROLE_KEY)
 * Se você não tiver essa chave, siga as instruções exibidas para criar os buckets manualmente.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isUsingAnonKey = !process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não definidas');
  process.exit(1);
}

console.log('URL do Supabase:', supabaseUrl);
console.log('Usando chave anônima:', isUsingAnonKey);

if (isUsingAnonKey) {
  console.warn('\n⚠️ ATENÇÃO: Você está usando a chave anônima, que não tem permissões para criar buckets.');
  console.warn('Para criar buckets, você precisa da chave de serviço (SUPABASE_SERVICE_ROLE_KEY).');
  console.warn('Este script apenas verificará se os buckets existem e fornecerá instruções para criá-los manualmente.\n');
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista de buckets necessários
const buckets = [
  {
    id: 'profile-photos',
    public: true,
    name: 'Fotos de Perfil',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'documents',
    public: false,
    name: 'Documentos',
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  {
    id: 'media',
    public: true,
    name: 'Mídia',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'audio/mpeg']
  }
];

// Função para listar buckets existentes
async function listBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Erro ao listar buckets:', error.message);
      return [];
    }
    
    console.log('Buckets existentes:', data.length ? data.map(b => b.name).join(', ') : 'Nenhum');
    return data || [];
  } catch (error) {
    console.error('Erro ao listar buckets:', error.message);
    return [];
  }
}

// Função para verificar se um bucket existe
async function checkBucket(bucket) {
  try {
    // Verificar se o bucket já existe
    const existingBuckets = await listBuckets();
    const bucketExists = existingBuckets.some(b => b.name === bucket.id);
    
    if (bucketExists) {
      console.log(`✅ Bucket '${bucket.id}' já existe`);
      return true;
    }
    
    console.log(`❌ Bucket '${bucket.id}' não existe`);
    
    // Se estiver usando a chave de serviço, tentar criar o bucket
    if (!isUsingAnonKey) {
      console.log(`Criando bucket '${bucket.id}'...`);
      
      // Criar o bucket
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.id === 'profile-photos' ? 2 * 1024 * 1024 : 10 * 1024 * 1024, // 2MB para fotos de perfil, 10MB para outros
        allowedMimeTypes: bucket.allowedMimeTypes
      });
      
      if (error) {
        console.error(`Erro ao criar bucket '${bucket.id}':`, error.message);
        return false;
      }
      
      console.log(`✅ Bucket '${bucket.id}' criado com sucesso`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erro ao verificar bucket '${bucket.id}':`, error.message);
    return false;
  }
}

// Função para exibir instruções de criação manual
function showManualInstructions() {
  console.log('\n📋 INSTRUÇÕES PARA CRIAR BUCKETS MANUALMENTE:');
  console.log('1. Acesse o painel do Supabase: https://app.supabase.io');
  console.log('2. Selecione seu projeto');
  console.log('3. Vá para "Storage" no menu lateral');
  console.log('4. Clique em "New Bucket" para cada bucket necessário:');
  
  buckets.forEach(bucket => {
    console.log(`\n   BUCKET: ${bucket.id}`);
    console.log(`   - Nome: ${bucket.id}`);
    console.log(`   - Visibilidade: ${bucket.public ? 'Público' : 'Privado'}`);
    console.log(`   - Limite de tamanho: ${bucket.id === 'profile-photos' ? '2MB' : '10MB'}`);
    console.log(`   - Tipos MIME permitidos: ${bucket.allowedMimeTypes.join(', ')}`);
  });
  
  console.log('\n5. Configure as políticas de acesso conforme necessário');
  console.log('   - Para buckets públicos, adicione uma política que permita acesso anônimo para leitura');
  console.log('   - Para todos os buckets, adicione políticas para usuários autenticados\n');
}

// Função principal
async function main() {
  console.log('Iniciando verificação de buckets no Supabase...\n');
  
  // Verificar buckets
  const results = [];
  for (const bucket of buckets) {
    const exists = await checkBucket(bucket);
    results.push({ bucket: bucket.id, exists });
  }
  
  // Exibir resumo
  console.log('\n📊 RESUMO:');
  const missingBuckets = results.filter(r => !r.exists).map(r => r.bucket);
  
  if (missingBuckets.length === 0) {
    console.log('✅ Todos os buckets necessários existem!');
  } else {
    console.log(`❌ Buckets faltando (${missingBuckets.length}): ${missingBuckets.join(', ')}`);
    
    if (isUsingAnonKey) {
      showManualInstructions();
    }
  }
  
  console.log('\nProcesso concluído');
}

// Executar função principal
main().catch(error => {
  console.error('Erro:', error);
  process.exit(1);
}); 