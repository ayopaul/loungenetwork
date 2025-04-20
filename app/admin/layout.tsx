export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
      <section className="p-8 bg-primary text-white min-h-screen">
        <h1 className="text-xl font-semibold text-foreground">Admin Area</h1>
        {children}
      </section>
    );
  }
  