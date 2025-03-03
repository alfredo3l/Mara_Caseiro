export default function Cadastro() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Capturar os dados do formulário
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    };

    // Validar se as senhas coincidem
    if (data.password !== data.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    // Redirecionar para a página de validação
    window.location.href = '/validate';
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Deputada Mara Caseiro</h1>
          <p className="text-foreground/80 mt-2">
            Crie sua conta de gestor
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-border shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-light transition-colors"
            >
              Criar conta
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-foreground/70">
              Já tem uma conta?{" "}
              <a href="/login" className="text-primary hover:underline">
                Faça login
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 