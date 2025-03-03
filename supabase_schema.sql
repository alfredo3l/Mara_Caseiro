-- Esquema de banco de dados para o Supabase
-- Este arquivo contém a estrutura das tabelas necessárias para o mapa de regiões

-- Tabela de coordenadores
CREATE TABLE coordenadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_coordenadores_updated_at
BEFORE UPDATE ON coordenadores
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de regiões
CREATE TABLE regioes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#CCCCCC',
  coordenador_id UUID REFERENCES coordenadores(id),
  municipios UUID[] DEFAULT '{}',
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_municipios_updated_at
BEFORE UPDATE ON municipios
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Políticas de segurança (RLS)
-- Permitir leitura pública
ALTER TABLE coordenadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura pública de coordenadores" ON coordenadores FOR SELECT USING (true);

ALTER TABLE regioes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura pública de regiões" ON regioes FOR SELECT USING (true);

ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura pública de municípios" ON municipios FOR SELECT USING (true);

-- Permitir escrita apenas para usuários autenticados
CREATE POLICY "Permitir escrita de coordenadores para usuários autenticados" ON coordenadores 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de coordenadores para usuários autenticados" ON coordenadores 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir escrita de regiões para usuários autenticados" ON regioes 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de regiões para usuários autenticados" ON regioes 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir escrita de municípios para usuários autenticados" ON municipios 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de municípios para usuários autenticados" ON municipios 
FOR UPDATE USING (auth.role() = 'authenticated');

-- Índices para melhorar a performance
CREATE INDEX idx_regioes_coordenador_id ON regioes(coordenador_id);
CREATE INDEX idx_municipios_regiao_id ON municipios(regiao_id);
CREATE INDEX idx_municipios_nome ON municipios(nome);

-- Comentários para documentação
COMMENT ON TABLE coordenadores IS 'Tabela de coordenadores responsáveis pelas regiões';
COMMENT ON TABLE regioes IS 'Tabela de regiões geográficas';
COMMENT ON TABLE municipios IS 'Tabela de municípios com dados geográficos';

-- Exemplo de inserção de dados
INSERT INTO coordenadores (nome, email, telefone) VALUES
('João Silva', 'joao.silva@exemplo.com', '(67) 99999-1111'),
('Maria Oliveira', 'maria.oliveira@exemplo.com', '(67) 99999-2222'),
('Pedro Santos', 'pedro.santos@exemplo.com', '(67) 99999-3333'),
('Ana Souza', 'ana.souza@exemplo.com', '(67) 99999-4444');

-- Exemplo de inserção de regiões
INSERT INTO regioes (nome, cor) VALUES
('Capital', '#4CAF50'),
('Sul', '#2196F3'),
('Leste', '#FFC107'),
('Pantanal', '#9C27B0');

-- Nota: A inserção de municípios com dados geográficos seria feita via API
-- devido à complexidade dos dados de coordenadas 