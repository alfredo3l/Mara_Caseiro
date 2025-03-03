# Sistema de Cores

Este diretório contém arquivos de configuração global do sistema, incluindo o sistema de cores.

## Arquivo `colors.ts`

O arquivo `colors.ts` centraliza todas as cores utilizadas no sistema, facilitando a alteração global e manutenção.

### Como utilizar

Para utilizar as cores em seu componente, importe o objeto `COLORS`:

```typescript
import COLORS from '@/config/colors';

// Exemplo de uso
const meuComponente = () => {
  return (
    <div style={{ backgroundColor: COLORS.PRIMARY }}>
      Conteúdo com cor primária
    </div>
  );
};
```

### Estrutura do objeto COLORS

```typescript
COLORS = {
  // Cores primárias
  PRIMARY: '#0F509C',
  PRIMARY_LIGHT: '#3291ff',
  
  // Cores de fundo e texto
  BACKGROUND: '#ffffff',
  FOREGROUND: '#171717',
  BORDER: '#e5e5e5',
  
  // Cores de temas alternativos
  DARK: { ... },
  GREEN: { ... },
  
  // Cores de estados
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  
  // Cores predefinidas para personalização
  PRESETS: [ ... ],
};
```

### Função `getColorWithOpacity`

O arquivo também exporta uma função útil para obter uma cor com opacidade:

```typescript
import { getColorWithOpacity } from '@/config/colors';

// Exemplo: cor primária com 50% de opacidade
const corComOpacidade = getColorWithOpacity(COLORS.PRIMARY, 0.5);
```

## Como alterar as cores do sistema

Para alterar as cores do sistema, edite o arquivo `colors.ts`. As alterações serão refletidas em todo o sistema, pois os componentes utilizam essas constantes.

### Fluxo de aplicação das cores

1. As cores são definidas no arquivo `colors.ts`
2. O `TemaContext` utiliza essas cores para criar os temas do sistema
3. Quando um tema é selecionado, as variáveis CSS são atualizadas
4. Os componentes utilizam as classes Tailwind (ex: `bg-primary`) ou as variáveis CSS diretamente

## Boas práticas

- Sempre utilize as constantes de cores em vez de valores hexadecimais diretamente no código
- Para adicionar novas cores, adicione-as ao arquivo `colors.ts`
- Mantenha a consistência visual utilizando as cores definidas no sistema 