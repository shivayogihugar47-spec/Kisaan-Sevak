import test from 'node:test';
import assert from 'node:assert/strict';
import { getAccountStatus, isBuyerPortalAllowed, isPendingBuyer } from '../src/utils/access.js';

test('pending buyer accounts are blocked until approved', () => {
  const profile = { role: 'buyer', status: 'pending_approval' };
  assert.equal(getAccountStatus(profile), 'pending_approval');
  assert.equal(isPendingBuyer(profile), true);
  assert.equal(isBuyerPortalAllowed(profile), false);
});

test('active buyer accounts can access the buyer portal', () => {
  const profile = { role: 'enterprise', status: 'active' };
  assert.equal(getAccountStatus(profile), 'active');
  assert.equal(isPendingBuyer(profile), false);
  assert.equal(isBuyerPortalAllowed(profile), true);
});
