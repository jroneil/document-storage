export default function PublicLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4">
            <h1 className="text-2xl font-bold">Document Storage</h1>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }