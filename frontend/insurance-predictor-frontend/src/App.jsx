import { useState } from 'react';
import { Activity, ArrowRight, BadgeDollarSign, CheckCircle2, HeartPulse, LoaderCircle, RotateCcw, ShieldCheck } from 'lucide-react';


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000/api/predict";

export default function App() {
  const [form, setForm] = useState({ age: '30', sex: 'female', children: '0', smoker: 'no' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm(current => ({ ...current, [e.target.name]: e.target.value }));
    setResult(null);
    setError('');
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: Number(form.age), sex: form.sex, children: Number(form.children), smoker: form.smoker })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || data.error || 'The prediction service returned an error.');
      const amount = data.predicted_charges ?? data.prediction ?? data.charges;
      if (typeof amount !== 'number' || !Number.isFinite(amount)) throw new Error('The API response did not contain a numeric predicted charge. Expected predicted_charges, prediction, or charges.');
      setResult(amount);
    } catch (err) {
      setError(err instanceof TypeError ? `Could not reach the prediction API at ${API_URL}. Start the Python model API and check its URL.` : err.message);
    } finally { setLoading(false); }
  }

  function reset() { setForm({ age: '30', sex: 'female', children: '0', smoker: 'no' }); setResult(null); setError(''); }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-icon"><HeartPulse size={22}/></span><span>CoverWise<span className="brand-dot">.</span></span></a><span className="model-chip"><span className="live-dot"/> Linear Regression Model</span></header>
    <main id="top">
      <section className="hero"><div className="eyebrow"><Activity size={15}/> PERSONAL ESTIMATE TOOL</div><h1>Understand your<br/><span>insurance costs.</span></h1><p className="hero-copy">Enter a few details to estimate medical insurance charges using the regression model trained in your notebook.</p><div className="trust-row"><span><ShieldCheck size={16}/> Model-based estimate</span><span><CheckCircle2 size={16}/> Simple and transparent</span></div></section>
      <section className="workspace">
        <form className="form-card" onSubmit={submit}>
          <div className="card-heading"><div><p className="step-label">YOUR DETAILS</p><h2>Build your estimate</h2></div><span className="number-badge">01</span></div>
          <div className="field"><label htmlFor="age">Age</label><div className="input-wrap"><input id="age" name="age" type="number" min="1" max="120" required value={form.age} onChange={update}/><span className="input-suffix">years</span></div></div>
          <div className="field"><label htmlFor="sex">Sex (as used in the training data)</label><select id="sex" name="sex" value={form.sex} onChange={update}><option value="female">Female</option><option value="male">Male</option></select></div>
          <div className="field"><label htmlFor="children">Number of children / dependants</label><select id="children" name="children" value={form.children} onChange={update}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
          <div className="field"><label>Smoking status</label><div className="choice-row"><label className={`choice ${form.smoker === 'no' ? 'selected' : ''}`}><input type="radio" name="smoker" value="no" checked={form.smoker === 'no'} onChange={update}/><span className="choice-mark"/ >Non-smoker</label><label className={`choice ${form.smoker === 'yes' ? 'selected' : ''}`}><input type="radio" name="smoker" value="yes" checked={form.smoker === 'yes'} onChange={update}/><span className="choice-mark"/>Smoker</label></div></div>
          <button className="submit-btn" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18}/> Calculating…</> : <>Estimate charges <ArrowRight size={18}/></>}</button>
          <button className="reset-btn" type="button" onClick={reset}><RotateCcw size={15}/> Reset details</button>
        </form>
        <aside className="result-card" aria-live="polite">
          <div className="result-top"><span className="result-icon"><BadgeDollarSign size={24}/></span><span className="step-label">YOUR RESULT</span></div>
          {result !== null ? <><p className="result-kicker">Predicted insurance charges</p><div className="amount">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(result)}</div><p className="result-description">This value was returned by your model API for the details you entered.</p><div className="result-summary"><div><span>Age</span><strong>{form.age} years</strong></div><div><span>Sex</span><strong>{form.sex[0].toUpperCase()+form.sex.slice(1)}</strong></div><div><span>Children</span><strong>{form.children}</strong></div><div><span>Smoker</span><strong>{form.smoker === 'yes' ? 'Yes' : 'No'}</strong></div></div></> : <><div className="empty-illustration"><div className="circle circle-one"/><div className="circle circle-two"/><div className="document-shape"><span/><span/><span/><div className="document-coin">$</div></div></div><h2>Your estimate<br/>will appear here</h2><p className="result-description">Complete the details and run the model to see its predicted insurance charge.</p></>}
          {error && <div className="error-box"><strong>Prediction unavailable</strong><p>{error}</p></div>}
          <div className="disclaimer"><ShieldCheck size={17}/><p><strong>Important note</strong><br/>This is an educational machine-learning estimate, not an insurance quote or medical/financial advice. Predictions depend on the training dataset and may not reflect real costs.</p></div>
        </aside>
      </section>
      <footer>CoverWise · Machine Learning Demo <span>Uses age, sex, children and smoker status</span></footer>
    </main>
  </div>;
}
