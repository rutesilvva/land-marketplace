import { useState } from 'react';

export default function AuthPanel({ onClose, onLogin, onRegister }) {
  const [mode,setMode]=useState('login'); const [values,setValues]=useState({name:'',email:'',password:''}); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const update=(e)=>setValues(v=>({...v,[e.target.name]:e.target.value}));
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{await (mode==='login'?onLogin(values.email,values.password):onRegister(values));onClose();}catch(err){setError(err.message);}finally{setBusy(false);}}
  return <div className="panel-backdrop"><aside className="form-panel"><form className="land-form" onSubmit={submit}>
    <div className="form-heading"><div><span className="eyebrow">Your account</span><h2>{mode==='login'?'Welcome back':'Create an account'}</h2></div><button className="icon-button" type="button" onClick={onClose}>×</button></div>
    {mode==='register'&&<><label htmlFor="auth-name">Name</label><input id="auth-name" name="name" required maxLength="120" value={values.name} onChange={update}/></>}
    <label htmlFor="auth-email">Email</label><input id="auth-email" name="email" type="email" required value={values.email} onChange={update}/>
    <label htmlFor="auth-password">Password</label><input id="auth-password" name="password" type="password" minLength="8" required value={values.password} onChange={update}/>
    {error&&<p className="form-error">{error}</p>}
    <div className="form-actions"><button className="button secondary" type="button" onClick={()=>{setMode(mode==='login'?'register':'login');setError('');}}>{mode==='login'?'Create account':'Use existing account'}</button><button className="button primary" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Register'}</button></div>
  </form></aside></div>;
}
