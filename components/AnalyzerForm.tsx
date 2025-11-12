"use client";

import { useMemo, useState } from 'react';
import { analyzeEmail } from '@/lib/analyzer-client';

export default function AnalyzerForm() {
  const [raw, setRaw] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const riskLevel = useMemo(() => {
    if (!result) return null;
    const score = result?.score ?? 0;
    if (score >= 80) return { label: 'Critical', color: '#b91c1c' };
    if (score >= 60) return { label: 'High', color: '#dc2626' };
    if (score >= 40) return { label: 'Medium', color: '#f59e0b' };
    if (score >= 20) return { label: 'Low', color: '#16a34a' };
    return { label: 'Minimal', color: '#16a34a' };
  }, [result]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw })
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRaw(text);
  }

  return (
    <section className="card">
      <form onSubmit={onSubmit} className="row">
        <div>
          <label><strong>Raw headers + body</strong></label>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={`Paste full email source including headers...`}></textarea>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <input type="file" accept=".eml,text/plain" onChange={onFileChange} />
            <button className="button" type="submit" disabled={isLoading || !raw.trim()}>
              {isLoading ? 'Analyzing?' : 'Analyze Email'}
            </button>
          </div>
        </div>
        <div>
          <strong>Result</strong>
          {!result && !error && <p>Submit to see analysis.</p>}
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          {result && (
            <div>
              <p className="score">Risk Score: <span className="badge" style={{ borderColor: riskLevel?.color, color: riskLevel?.color }}>{result.score} / 100 ({riskLevel?.label})</span></p>
              <div className="kv">
                <div>From</div><div>{result.summary.from || '?'}</div>
                <div>To</div><div>{result.summary.to || '?'}</div>
                <div>Subject</div><div>{result.summary.subject || '?'}</div>
                <div>SPF</div><div>{result.signals.spf.pass ? 'pass' : 'fail'}</div>
                <div>DKIM</div><div>{result.signals.dkim.pass ? 'pass' : 'fail'}</div>
                <div>DMARC</div><div>{result.signals.dmarc.pass ? 'pass' : 'fail'}</div>
              </div>

              <h4>Indicators</h4>
              <ul className="list">
                {result.indicators.map((x: any, idx: number) => (
                  <li key={idx}>[{x.severity}] {x.message}</li>
                ))}
              </ul>

              <h4>Links</h4>
              {result.links.length === 0 ? <p>No links found.</p> : (
                <ul className="list">
                  {result.links.map((l: any, idx: number) => (
                    <li key={idx}><a href={l.url} target="_blank" rel="noreferrer">{l.url}</a> ({l.classification})</li>
                  ))}
                </ul>
              )}

              <h4>Header Summary</h4>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.headers, null, 2)}</pre>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
