
-- Esquema de banco de dados para o Supabase
-- Este arquivo contém a estrutura das tabelas necessárias para o sistema Evolução Política

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela de organizações
CREATE TABLE organizacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('partido', 'campanha', 'coligacao', 'outro')),
  logo TEXT,
  cores JSONB DEFAULT '{"primaria": "#3B82F6", "secundaria": "#1E40AF"}',
  contato JSONB DEFAULT '{}',
  endereco JSONB DEFAULT '{}',
  plano TEXT NOT NULL DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'basico', 'profissional', 'enterprise')),
  limites JSONB DEFAULT '{"usuarios": 5, "apoiadores": 100, "armazenamento": 100, "consultasIA": 10}',
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'trial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_organizacoes_updated_at
BEFORE UPDATE ON organizacoes
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('super_admin', 'admin', 'coordenador', 'lideranca', 'apoiador')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pendente')),
  telefone TEXT,
  foto_url TEXT,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de permissões
CREATE TABLE permissoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  perfil TEXT NOT NULL CHECK (perfil IN ('super_admin', 'admin', 'coordenador', 'lideranca', 'apoiador')),
  recurso TEXT NOT NULL,
  acoes TEXT[] NOT NULL,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(perfil, recurso, organizacao_id)
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_permissoes_updated_at
BEFORE UPDATE ON permissoes
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de partidos políticos
CREATE TABLE partidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sigla TEXT NOT NULL,
  nome TEXT NOT NULL,
  numero INTEGER NOT NULL,
  logo TEXT,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sigla, organizacao_id)
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_partidos_updated_at
BEFORE UPDATE ON partidos
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de candidatos
CREATE TABLE candidatos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  nome_urna TEXT NOT NULL,
  cargo TEXT NOT NULL CHECK (cargo IN ('Vereador', 'Prefeito', 'Deputado Estadual', 'Deputado Federal', 'Governador', 'Senador', 'Presidente')),
  partido_id UUID REFERENCES partidos(id),
  local_candidatura JSONB NOT NULL,
  contato JSONB NOT NULL,
  biografia TEXT,
  foto_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('Pré-Candidato', 'Candidato', 'Eleito', 'Não Eleito')),
  qtd_votos INTEGER,
  meta_votos INTEGER,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_candidatos_updated_at
BEFORE UPDATE ON candidatos
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de regiões
CREATE TABLE regioes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'região' CHECK (tipo IN ('região', 'zona', 'bairro')),
  cor TEXT NOT NULL DEFAULT '#CCCCCC',
  coordenador_id UUID,
  municipios UUID[] DEFAULT '{}',
  dados_demograficos JSONB DEFAULT '{}',
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_regioes_updated_at
BEFORE UPDATE ON regioes
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de municípios
CREATE TABLE municipios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  regiao_id UUID REFERENCES regioes(id),
  populacao INTEGER DEFAULT 0,
  area NUMERIC(10, 3) DEFAULT 0,
  coordenadas JSONB,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_municipios_updated_at
BEFORE UPDATE ON municipios
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de lideranças
CREATE TABLE liderancas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  contato JSONB NOT NULL,
  endereco JSONB NOT NULL,
  foto_url TEXT,
  qtd_apoiadores INTEGER DEFAULT 0,
  meta_apoiadores INTEGER,
  regiao_id UUID REFERENCES regioes(id),
  candidato_id UUID REFERENCES candidatos(id),
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_liderancas_updated_at
BEFORE UPDATE ON liderancas
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de apoiadores
CREATE TABLE apoiadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  titulo TEXT,
  zona TEXT,
  secao TEXT,
  endereco JSONB NOT NULL,
  contato JSONB NOT NULL,
  redes_sociais JSONB,
  profissao TEXT,
  observacoes TEXT,
  foto_url TEXT,
  lideranca_id UUID REFERENCES liderancas(id),
  ultimo_contato TIMESTAMP WITH TIME ZONE,
  nivel_engajamento TEXT NOT NULL DEFAULT 'Médio' CHECK (nivel_engajamento IN ('Baixo', 'Médio', 'Alto')),
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  tags TEXT[],
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_apoiadores_updated_at
BEFORE UPDATE ON apoiadores
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de apoios políticos
CREATE TABLE apoios_politicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id),
  candidato_apoiado_id UUID NOT NULL REFERENCES candidatos(id),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Pendente')),
  observacoes TEXT,
  publico_url TEXT,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (candidato_id != candidato_apoiado_id)
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_apoios_politicos_updated_at
BEFORE UPDATE ON apoios_politicos
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de demandas
CREATE TABLE demandas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Interna', 'Externa')),
  categoria TEXT NOT NULL CHECK (categoria IN ('Infraestrutura', 'Saúde', 'Educação', 'Segurança', 'Outros')),
  prioridade TEXT NOT NULL DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Urgente')),
  status TEXT NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Em Análise', 'Em Andamento', 'Concluída', 'Cancelada')),
  solicitante_id UUID NOT NULL,
  solicitante_tipo TEXT NOT NULL CHECK (solicitante_tipo IN ('Liderança', 'Apoiador', 'Candidato', 'Coordenador')),
  responsavel_id UUID,
  localizacao JSONB,
  data_limite DATE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_demandas_updated_at
BEFORE UPDATE ON demandas
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de atualizações de demandas
CREATE TABLE demandas_atualizacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demanda_id UUID NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  comentario TEXT NOT NULL,
  status TEXT CHECK (status IN ('Aberta', 'Em Análise', 'Em Andamento', 'Concluída', 'Cancelada')),
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anexos de demandas
CREATE TABLE demandas_anexos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demanda_id UUID NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Reunião', 'Comício', 'Caminhada', 'Debate', 'Entrevista', 'Outro')),
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  local JSONB NOT NULL,
  organizador_id UUID NOT NULL,
  organizador_tipo TEXT NOT NULL CHECK (organizador_tipo IN ('Candidato', 'Coordenador', 'Liderança')),
  status TEXT NOT NULL DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Confirmado', 'Em Andamento', 'Concluído', 'Cancelado')),
  observacoes TEXT,
  notificar BOOLEAN NOT NULL DEFAULT TRUE,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_eventos_updated_at
BEFORE UPDATE ON eventos
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de participantes de eventos
CREATE TABLE eventos_participantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  participante_id UUID NOT NULL,
  participante_tipo TEXT NOT NULL CHECK (participante_tipo IN ('Candidato', 'Coordenador', 'Liderança', 'Apoiador')),
  confirmado BOOLEAN NOT NULL DEFAULT FALSE,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evento_id, participante_id, participante_tipo)
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_eventos_participantes_updated_at
BEFORE UPDATE ON eventos_participantes
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de recursos de eventos
CREATE TABLE eventos_recursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  responsavel TEXT,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_eventos_recursos_updated_at
BEFORE UPDATE ON eventos_recursos
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de anexos de eventos
CREATE TABLE eventos_anexos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de documentos
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  tamanho INTEGER NOT NULL,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  tags TEXT[],
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_documentos_updated_at
BEFORE UPDATE ON documentos
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de notificações
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'sucesso', 'alerta', 'erro')),
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs do sistema
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  acao TEXT NOT NULL,
  recurso TEXT NOT NULL,
  recurso_id UUID,
  detalhes JSONB,
  ip TEXT,
  user_agent TEXT,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conversas com IA
CREATE TABLE ia_conversas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  titulo TEXT NOT NULL,
  contexto TEXT,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_ia_conversas_updated_at
BEFORE UPDATE ON ia_conversas
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de mensagens de IA
CREATE TABLE ia_mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversa_id UUID NOT NULL REFERENCES ia_conversas(id) ON DELETE CASCADE,
  remetente TEXT NOT NULL CHECK (remetente IN ('usuario', 'assistente')),
  conteudo TEXT NOT NULL,
  tokens_utilizados INTEGER,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança (RLS)
-- Habilitar RLS em todas as tabelas
ALTER TABLE organizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE regioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE liderancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE apoiadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE apoios_politicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandas_atualizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandas_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_mensagens ENABLE ROW LEVEL SECURITY;

-- Política para super_admin acessar todas as organizações
CREATE POLICY "Super admin pode acessar todas as organizações" ON organizacoes
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.auth_id = auth.uid()
    AND usuarios.perfil = 'super_admin'
  )
);

-- Política para usuários acessarem apenas sua organização
CREATE POLICY "Usuários podem acessar apenas sua organização" ON organizacoes
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT organizacao_id FROM usuarios
    WHERE usuarios.auth_id = auth.uid()
  )
);

-- Política geral para todas as tabelas com organizacao_id
-- Função auxiliar para verificar se o usuário pertence à organização
CREATE OR REPLACE FUNCTION auth.user_belongs_to_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    JOIN public.usuarios ON usuarios.auth_id = auth.users.id
    WHERE auth.users.id = auth.uid()
    AND usuarios.organizacao_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Macro para criar políticas padrão para tabelas com organizacao_id
DO $$ 
DECLARE
  tabela text;
BEGIN
  FOR tabela IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name != 'organizacoes'
    AND table_name IN (
      'usuarios', 'permissoes', 'partidos', 'candidatos', 'regioes', 
      'municipios', 'liderancas', 'apoiadores', 'apoios_politicos', 
      'demandas', 'demandas_atualizacoes', 'demandas_anexos', 'eventos', 
      'eventos_participantes', 'eventos_recursos', 'eventos_anexos', 
      'documentos', 'notificacoes', 'logs', 'ia_conversas', 'ia_mensagens'
    )
  LOOP
    EXECUTE format('
      CREATE POLICY "Usuários podem ler registros de sua organização" ON %I
      FOR SELECT TO authenticated
      USING (auth.user_belongs_to_organization(organizacao_id));
      
      CREATE POLICY "Usuários podem inserir registros em sua organização" ON %I
      FOR INSERT TO authenticated
      WITH CHECK (auth.user_belongs_to_organization(organizacao_id));
      
      CREATE POLICY "Usuários podem atualizar registros de sua organização" ON %I
      FOR UPDATE TO authenticated
      USING (auth.user_belongs_to_organization(organizacao_id))
      WITH CHECK (auth.user_belongs_to_organization(organizacao_id));
      
      CREATE POLICY "Usuários podem excluir registros de sua organização" ON %I
      FOR DELETE TO authenticated
      USING (auth.user_belongs_to_organization(organizacao_id));
    ', tabela, tabela, tabela, tabela);
  END LOOP;
END $$;

-- Índices para melhorar a performance
CREATE INDEX idx_usuarios_organizacao_id ON usuarios(organizacao_id);
CREATE INDEX idx_permissoes_organizacao_id ON permissoes(organizacao_id);
CREATE INDEX idx_partidos_organizacao_id ON partidos(organizacao_id);
CREATE INDEX idx_candidatos_organizacao_id ON candidatos(organizacao_id);
CREATE INDEX idx_regioes_organizacao_id ON regioes(organizacao_id);
CREATE INDEX idx_municipios_organizacao_id ON municipios(organizacao_id);
CREATE INDEX idx_liderancas_organizacao_id ON liderancas(organizacao_id);
CREATE INDEX idx_apoiadores_organizacao_id ON apoiadores(organizacao_id);
CREATE INDEX idx_apoiadores_lideranca_id ON apoiadores(lideranca_id);
CREATE INDEX idx_apoios_politicos_organizacao_id ON apoios_politicos(organizacao_id);
CREATE INDEX idx_demandas_organizacao_id ON demandas(organizacao_id);
CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_eventos_organizacao_id ON eventos(organizacao_id);
CREATE INDEX idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX idx_eventos_status ON eventos(status);
CREATE INDEX idx_documentos_organizacao_id ON documentos(organizacao_id);
CREATE INDEX idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX idx_logs_organizacao_id ON logs(organizacao_id);
CREATE INDEX idx_ia_conversas_usuario_id ON ia_conversas(usuario_id);

-- Comentários para documentação
COMMENT ON TABLE organizacoes IS 'Tabela de organizações que utilizam o sistema';
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema';
COMMENT ON TABLE permissoes IS 'Tabela de permissões de acesso por perfil';
COMMENT ON TABLE partidos IS 'Tabela de partidos políticos';
COMMENT ON TABLE candidatos IS 'Tabela de candidatos políticos';
COMMENT ON TABLE regioes IS 'Tabela de regiões geográficas';
COMMENT ON TABLE municipios IS 'Tabela de municípios';
COMMENT ON TABLE liderancas IS 'Tabela de lideranças políticas';
COMMENT ON TABLE apoiadores IS 'Tabela de apoiadores da campanha';
COMMENT ON TABLE apoios_politicos IS 'Tabela de apoios entre candidatos';
COMMENT ON TABLE demandas IS 'Tabela de demandas e solicitações';
COMMENT ON TABLE demandas_atualizacoes IS 'Tabela de atualizações de demandas';
COMMENT ON TABLE demandas_anexos IS 'Tabela de anexos de demandas';
COMMENT ON TABLE eventos IS 'Tabela de eventos da campanha';
COMMENT ON TABLE eventos_participantes IS 'Tabela de participantes de eventos';
COMMENT ON TABLE eventos_recursos IS 'Tabela de recursos necessários para eventos';
COMMENT ON TABLE eventos_anexos IS 'Tabela de anexos de eventos';
COMMENT ON TABLE documentos IS 'Tabela de documentos do sistema';
COMMENT ON TABLE notificacoes IS 'Tabela de notificações para usuários';
COMMENT ON TABLE logs IS 'Tabela de logs de atividades do sistema';
COMMENT ON TABLE ia_conversas IS 'Tabela de conversas com o assistente de IA';
COMMENT ON TABLE ia_mensagens IS 'Tabela de mensagens trocadas com o assistente de IA'; 