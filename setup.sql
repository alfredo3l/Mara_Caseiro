INSERT INTO organizacoes (id, nome, tipo, plano, status) VALUES ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Mara Caseiro', 'campanha', 'gratuito', 'ativa') ON CONFLICT (id) DO NOTHING;
