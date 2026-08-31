import { useEffect,useState } from 'react';
import { createProposal,getMyProposals,getReceivedProposals,updateProposal } from '../api/proposals.js';
const money=(n)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
export default function ProposalPanel({land,onClose,notice}){
 const [amount,setAmount]=useState(land?.price||'');const [message,setMessage]=useState('');const [sent,setSent]=useState([]);const [received,setReceived]=useState([]);const [busy,setBusy]=useState(false);
 const load=async()=>{const [mine,inbox]=await Promise.all([getMyProposals(),getReceivedProposals()]);setSent(mine);setReceived(inbox);};
 useEffect(()=>{load().catch(e=>notice('error',e.message));},[]);
 async function submit(e){e.preventDefault();setBusy(true);try{await createProposal({landId:land.id,amount:Number(amount),message});notice('success','Proposal sent to the land owner.');await load();}catch(err){notice('error',err.message);}finally{setBusy(false);}}
 async function change(id,status){try{await updateProposal(id,status);await load();notice('success','Proposal updated.');}catch(err){notice('error',err.message);}}
 const list=(items,receivedList)=><div className="proposal-list">{items.length===0?<p className="empty-state">No proposals here yet.</p>:items.map(p=><article className="proposal-item" key={p.id}><div><strong>{money(p.amount)}</strong><span className={`proposal-status ${p.status.toLowerCase()}`}>{p.status}</span></div><p>{p.landDescription}</p><small>{receivedList?`${p.buyerName} · ${p.buyerEmail}`:p.message}</small>{p.status==='PENDING'&&<div className="proposal-actions">{receivedList?<><button onClick={()=>change(p.id,'ACCEPTED')}>Accept</button><button onClick={()=>change(p.id,'REJECTED')}>Reject</button></>:<button onClick={()=>change(p.id,'WITHDRAWN')}>Withdraw</button>}</div>}</article>)}</div>;
 return <div className="panel-backdrop"><aside className="form-panel proposal-panel"><div className="form-heading"><div><span className="eyebrow">Negotiations</span><h2>{land?'Make a proposal':'Your proposals'}</h2></div><button className="icon-button" type="button" aria-label="Close proposals" onClick={onClose}>×</button></div>
 {land&&<form className="land-form proposal-form" onSubmit={submit}><label htmlFor="proposal-amount">Offer amount</label><input id="proposal-amount" type="number" min="0.01" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)}/><label htmlFor="proposal-message">Message</label><textarea id="proposal-message" required maxLength="1000" rows="3" value={message} onChange={e=>setMessage(e.target.value)}/><button className="button primary" disabled={busy}>{busy?'Sending…':'Send proposal'}</button></form>}
 <h3>Received</h3>{list(received,true)}<h3>Sent</h3>{list(sent,false)}</aside></div>;
}
