import AnalyzerForm from '@/components/AnalyzerForm';

export default function Page() {
  return (
    <main className="container">
      <header className="header">
        <h1>Email Monitoring ? Cybersecurity Analyzer</h1>
        <p>Paste raw email headers/body or upload an .eml file to analyze for threats.</p>
      </header>
      <AnalyzerForm />
      <footer className="footer">Built for rapid email triage and phishing detection.</footer>
    </main>
  );
}
