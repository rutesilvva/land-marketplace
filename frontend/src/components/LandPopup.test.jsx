import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LandPopup from './LandPopup.jsx';

describe('LandPopup', () => {
  it('stays hidden without a selected land', () => {
    const { container } = render(<LandPopup land={null} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows land details and closes', async () => {
    const onClose = vi.fn();
    render(<LandPopup land={{ price: 250000, description: 'Sunny rural parcel', contact: 'owner@example.com' }} onClose={onClose} />);
    expect(screen.getByText('Sunny rural parcel')).toBeVisible();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:owner@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Close details' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('lets another signed-in user propose', async () => {
    const onProposal = vi.fn();
    const land = { id: 'l1', ownerId: 'owner', ownerName: 'Owner', price: 10, description: 'Lot', contact: 'o@test.com' };
    render(<LandPopup land={land} user={{ id: 'buyer' }} onProposal={onProposal} onClose={() => {}} />);
    expect(screen.getByText('Listed by Owner')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Make proposal' }));
    expect(onProposal).toHaveBeenCalledWith(land);
  });
});
