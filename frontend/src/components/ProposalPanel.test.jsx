import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProposal, getMyProposals, getReceivedProposals, updateProposal } from '../api/proposals.js';
import ProposalPanel from './ProposalPanel.jsx';

vi.mock('../api/proposals.js', () => ({ createProposal:vi.fn(),getMyProposals:vi.fn(),getReceivedProposals:vi.fn(),updateProposal:vi.fn() }));

const pending={id:'p1',landId:'l1',landDescription:'Green parcel',buyerName:'Buyer',buyerEmail:'buyer@test.com',amount:120000,message:'My offer',status:'PENDING'};
describe('ProposalPanel',()=>{
 beforeEach(()=>{vi.clearAllMocks();getMyProposals.mockResolvedValue([]);getReceivedProposals.mockResolvedValue([]);updateProposal.mockResolvedValue({});});
 it('sends a proposal and refreshes the workspace',async()=>{createProposal.mockResolvedValue(pending);const notice=vi.fn();render(<ProposalPanel land={{id:'l1',price:125000}} onClose={vi.fn()} notice={notice}/>);await waitFor(()=>expect(getMyProposals).toHaveBeenCalled());await userEvent.clear(screen.getByLabelText('Offer amount'));await userEvent.type(screen.getByLabelText('Offer amount'),'120000');await userEvent.type(screen.getByLabelText('Message'),'My offer');await userEvent.click(screen.getByRole('button',{name:'Send proposal'}));await waitFor(()=>expect(createProposal).toHaveBeenCalledWith({landId:'l1',amount:120000,message:'My offer'}));expect(notice).toHaveBeenCalledWith('success','Proposal sent to the land owner.');});
 it('accepts received and withdraws sent proposals',async()=>{getMyProposals.mockResolvedValue([pending]);getReceivedProposals.mockResolvedValue([pending]);render(<ProposalPanel land={null} onClose={vi.fn()} notice={vi.fn()}/>);expect(await screen.findAllByText('Green parcel')).toHaveLength(2);await userEvent.click(screen.getByRole('button',{name:'Accept'}));await waitFor(()=>expect(updateProposal).toHaveBeenCalledWith('p1','ACCEPTED'));await userEvent.click(screen.getByRole('button',{name:'Withdraw'}));expect(updateProposal).toHaveBeenCalledWith('p1','WITHDRAWN');});
 it('reports loading and action failures and closes',async()=>{const notice=vi.fn();const close=vi.fn();getMyProposals.mockRejectedValue(new Error('Inbox failed'));render(<ProposalPanel land={null} onClose={close} notice={notice}/>);await waitFor(()=>expect(notice).toHaveBeenCalledWith('error','Inbox failed'));await userEvent.click(screen.getByRole('button',{name:'Close proposals'}));expect(close).toHaveBeenCalled();});
});
