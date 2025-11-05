export const metadata = {
  title: 'Agentic Dubbing',
  description: 'Advanced web-based video dubbing tool'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', background: '#0b0f14', color: '#e6edf3' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, margin: 0 }}>Agentic Dubbing</h1>
            <a href="https://github.com/" target="_blank" rel="noreferrer" style={{ color: '#8ab4f8' }}>Docs</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
