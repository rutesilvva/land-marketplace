import { afterEach,describe,expect,it,vi } from 'vitest';
import { clearCredentials,currentUser,login,register } from './auth.js';
import { createProposal,getMyProposals,getReceivedProposals,updateProposal } from './proposals.js';

const ok=(value)=>({ok:true,json:vi.fn().mockResolvedValue(value)});
describe('account and proposal APIs',()=>{
 afterEach(()=>{vi.unstubAllGlobals();localStorage.clear();});
 it('logs in and restores the current account',async()=>{const fetchMock=vi.fn().mockResolvedValue(ok({id:'u1'}));vi.stubGlobal('fetch',fetchMock);await expect(login('a@b.com','password1')).resolves.toEqual({id:'u1'});expect(localStorage.getItem('parcel-credentials')).toBeTruthy();await currentUser();expect(fetchMock).toHaveBeenLastCalledWith('/api/auth/me',expect.objectContaining({headers:expect.objectContaining({Authorization:expect.stringContaining('Basic ')})}));clearCredentials();expect(localStorage.getItem('parcel-credentials')).toBeNull();});
 it('clears invalid credentials',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,json:vi.fn().mockResolvedValue({message:'Wrong password'})}));await expect(login('a@b.com','wrongpass')).rejects.toThrow('Wrong password');expect(localStorage.getItem('parcel-credentials')).toBeNull();});
 it('registers then signs in',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(ok({id:'u1'})).mockResolvedValueOnce(ok({id:'u1'})));await expect(register({name:'A',email:'a@b.com',password:'password1'})).resolves.toEqual({id:'u1'});});
 it('covers proposal lifecycle requests',async()=>{const fetchMock=vi.fn().mockResolvedValue(ok([]));vi.stubGlobal('fetch',fetchMock);await createProposal({landId:'l1',amount:20,message:'Offer'});await getMyProposals();await getReceivedProposals();await updateProposal('p1','ACCEPTED');expect(fetchMock).toHaveBeenCalledTimes(4);expect(fetchMock.mock.calls[3][1]).toEqual(expect.objectContaining({method:'PATCH'}));});
 it('uses a safe proposal error',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,json:vi.fn().mockRejectedValue(new Error('bad'))}));await expect(getMyProposals()).rejects.toThrow('The proposal request failed.');});
});
