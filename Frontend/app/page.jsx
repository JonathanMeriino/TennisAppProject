import FormLogin from "@/components/form_login"; // Ajusta la ruta según dónde hayas guardado tu componente

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <h1 className="text-2xl font-bold text-primary">Tennis App</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          
          {/* Aquí montamos el componente separado */}
          <FormLogin />

          <div className="text-center text-xs text-muted-foreground">
            <p>Inicia sesión con las credenciales de tu cuenta</p>
          </div>
        </div>
      </main>
    </div>
  );
}
