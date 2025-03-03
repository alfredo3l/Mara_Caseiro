# Correções de Erros de Linter

Este documento contém instruções para corrigir os erros de linter identificados no código do projeto.

## Erros no arquivo `src/services/supabase.ts`

### 1. Erro: Property 'range' does not exist

**Problema:**
```typescript
.range(from, to)
```

**Solução:**
Este erro ocorre porque o TypeScript não reconhece o método `range` nos tipos do Supabase. Precisamos adicionar uma asserção de tipo:

```typescript
// Antes
query
  .select(select, { count: 'exact' })
  .eq('organizacao_id', organizacaoId)
  .range(from, to)
  .order(orderBy, { ascending: orderDirection === 'asc' });

// Depois
(query
  .select(select, { count: 'exact' })
  .eq('organizacao_id', organizacaoId) as any)
  .range(from, to)
  .order(orderBy, { ascending: orderDirection === 'asc' });
```

### 2. Erro: Property 'contains', 'like', 'gt', etc. não existem

**Problema:**
```typescript
query = query.contains(key, value.contains);
query = query.ilike(key, `%${value.like}%`);
// etc.
```

**Solução:**
Adicionar asserções de tipo para cada operação:

```typescript
if ('contains' in value) {
  query = (query as any).contains(key, value.contains);
} else if ('like' in value) {
  query = (query as any).ilike(key, `%${value.like}%`);
} else if ('gt' in value) {
  query = (query as any).gt(key, value.gt);
} else if ('lt' in value) {
  query = (query as any).lt(key, value.lt);
} else if ('gte' in value) {
  query = (query as any).gte(key, value.gte);
} else if ('lte' in value) {
  query = (query as any).lte(key, value.lte);
} else if ('neq' in value) {
  query = (query as any).neq(key, value.neq);
}
```

### 3. Erro: Property 'single' does not exist

**Problema:**
```typescript
.single();
```

**Solução:**
Adicionar asserção de tipo:

```typescript
// Antes
const { data, error } = await supabase
  .from(this.table)
  .select(select)
  .eq('id', id)
  .eq('organizacao_id', organizacaoId)
  .single();

// Depois
const { data, error } = await (supabase
  .from(this.table)
  .select(select)
  .eq('id', id)
  .eq('organizacao_id', organizacaoId) as any)
  .single();
```

### 4. Erro: No overload matches this call (insert)

**Problema:**
```typescript
.insert(dataWithOrg)
```

**Solução:**
Corrigir o tipo dos dados inseridos:

```typescript
// Antes
const { data: createdData, error } = await supabase
  .from(this.table)
  .insert(dataWithOrg)
  .select()
  .single();

// Depois
const { data: createdData, error } = await (supabase
  .from(this.table)
  .insert(dataWithOrg as any) as any)
  .select()
  .single();
```

### 5. Erro: Property 'select' does not exist

**Problema:**
```typescript
.select()
```

**Solução:**
Adicionar asserção de tipo:

```typescript
// Antes
const { data: createdData, error } = await supabase
  .from(this.table)
  .insert(dataWithOrg)
  .select()
  .single();

// Depois
const { data: createdData, error } = await (supabase
  .from(this.table)
  .insert(dataWithOrg as any) as any)
  .select()
  .single();
```

### 6. Erro: Property 'eq' does not exist (update)

**Problema:**
```typescript
.update(data)
.eq('id', id)
```

**Solução:**
Adicionar asserção de tipo:

```typescript
// Antes
const { data: updatedData, error } = await supabase
  .from(this.table)
  .update(data)
  .eq('id', id)
  .eq('organizacao_id', organizacaoId)
  .select()
  .single();

// Depois
const { data: updatedData, error } = await (supabase
  .from(this.table)
  .update(data as any) as any)
  .eq('id', id)
  .eq('organizacao_id', organizacaoId)
  .select()
  .single();
```

### 7. Erro: Property 'eq' does not exist (delete)

**Problema:**
```typescript
.delete()
.eq('id', id)
```

**Solução:**
Adicionar asserção de tipo:

```typescript
// Antes
const { error } = await supabase
  .from(this.table)
  .delete()
  .eq('id', id)
  .eq('organizacao_id', organizacaoId);

// Depois
const { error } = await (supabase
  .from(this.table)
  .delete() as any)
  .eq('id', id)
  .eq('organizacao_id', organizacaoId);
```

## Erros no arquivo `src/hooks/useDemandas.ts`

### 1. Erro: This comparison appears to be unintentional

**Problema:**
```typescript
else if (key === 'dataInicio' && key === 'dataFim')
```

**Solução:**
Corrigir a condição lógica:

```typescript
// Antes
else if (key === 'dataInicio' && key === 'dataFim')

// Depois
else if (key === 'dataInicio' || key === 'dataFim')
```

### 2. Erro: 'atualizacoes' is of type 'unknown'

**Problema:**
```typescript
atualizacoes: atualizacoes.data || [],
```

**Solução:**
Adicionar asserção de tipo:

```typescript
// Antes
return {
  ...demanda,
  atualizacoes: atualizacoes.data || [],
  anexos: anexos.data || []
} as Demanda;

// Depois
return {
  ...demanda,
  atualizacoes: (atualizacoes as any).data || [],
  anexos: (anexos as any).data || []
} as Demanda;
```

### 3. Erro: 'result' is of type 'unknown'

**Problema:**
```typescript
return result.data || [];
```

**Solução:**
Adicionar asserção de tipo:

```typescript
// Antes
return result.data || [];

// Depois
return (result as any).data || [];
```

## Erros no arquivo `src/hooks/useEventos.ts`

### 1. Erro: 'participantes' is of type 'unknown'

**Problema:**
```typescript
participantes: participantes.data || [],
```

**Solução:**
Adicionar asserção de tipo:

```typescript
// Antes
return {
  ...evento,
  participantes: participantes.data || [],
  recursos: recursos.data || [],
  anexos: anexos.data || []
} as Evento;

// Depois
return {
  ...evento,
  participantes: (participantes as any).data || [],
  recursos: (recursos as any).data || [],
  anexos: (anexos as any).data || []
} as Evento;
```

### 2. Erro: 'participantes' is of type 'unknown' (confirmarParticipacao)

**Problema:**
```typescript
if (participantes.data && participantes.data.id) {
  // Atualizar o status de confirmação
  const participanteAtualizado = await eventosParticipantesService.update(
    participantes.data.id,
    { confirmado: true }
  );
```

**Solução:**
Adicionar asserção de tipo:

```typescript
// Antes
if (participantes.data && participantes.data.id) {
  // Atualizar o status de confirmação
  const participanteAtualizado = await eventosParticipantesService.update(
    participantes.data.id,
    { confirmado: true }
  );

// Depois
if ((participantes as any).data && (participantes as any).data.id) {
  // Atualizar o status de confirmação
  const participanteAtualizado = await eventosParticipantesService.update(
    (participantes as any).data.id,
    { confirmado: true }
  );
```

### 3. Erro: 'participantes' is of type 'unknown' (removerParticipante)

**Problema:**
```typescript
if (participantes.data && participantes.data.id) {
  // Remover o participante
  const sucesso = await eventosParticipantesService.delete(participantes.data.id);
  
  return sucesso;
}
```

**Solução:**
Adicionar asserção de tipo:

```typescript
// Antes
if (participantes.data && participantes.data.id) {
  // Remover o participante
  const sucesso = await eventosParticipantesService.delete(participantes.data.id);
  
  return sucesso;
}

// Depois
if ((participantes as any).data && (participantes as any).data.id) {
  // Remover o participante
  const sucesso = await eventosParticipantesService.delete((participantes as any).data.id);
  
  return sucesso;
}
```

## Solução Alternativa: Definir Tipos Adequados

Uma solução mais elegante para esses problemas seria definir tipos adequados para os resultados das consultas do Supabase. Por exemplo:

```typescript
// Definir interfaces para os resultados do Supabase
interface SupabaseQueryResult<T> {
  data: T[] | null;
  error: any;
  count?: number;
}

interface SupabaseSingleResult<T> {
  data: T | null;
  error: any;
}

// Usar essas interfaces nas funções
const { data, error } = await supabase.from(this.table).select() as unknown as SupabaseQueryResult<T>;

// Para resultados únicos
const { data, error } = await supabase.from(this.table).select().single() as unknown as SupabaseSingleResult<T>;
```

Isso tornaria o código mais seguro em termos de tipos e evitaria o uso excessivo de `as any`.

## Recomendação Final

Para uma solução mais robusta, recomendamos:

1. Criar tipos adequados para os resultados do Supabase
2. Atualizar a biblioteca de tipos do Supabase para a versão mais recente
3. Considerar o uso de funções auxiliares tipadas para operações comuns
4. Implementar validação de dados antes de usar os resultados das consultas

Essas abordagens melhorarão a segurança de tipos e reduzirão a necessidade de asserções de tipo (`as any`) no código. 