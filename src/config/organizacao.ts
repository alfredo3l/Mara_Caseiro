/**
 * Configuração da organização
 * 
 * Este arquivo contém a configuração da organização atual.
 * Quando o projeto for replicado para outra organização, apenas este arquivo
 * precisa ser alterado com o novo ID da organização.
 */

// ID da organização atual
export const ORGANIZACAO_ID = "d290f1ee-6c54-4b01-90e6-d701748f0851";

// Nome da organização
export const ORGANIZACAO_NOME = "Mara Caseiro";

// Função para obter o ID da organização
export const getOrganizacaoId = () => {
  return ORGANIZACAO_ID;
};

// Função para obter o nome da organização
export const getOrganizacaoNome = () => {
  return ORGANIZACAO_NOME;
};

// Função para verificar se um item pertence à organização atual
export const pertenceOrganizacaoAtual = (organizacaoId: string) => {
  return organizacaoId === ORGANIZACAO_ID;
}; 