import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import * as powerbox from '../static/powerbox.mjs';

/**
 * @typedef {import('../static/powerbox.mjs').Powerbox} Powerbox
 */

/**
 * Assert that given error is a revoked proxy error.
 *
 * @param {any} err
 * @returns
 */
const checkError = (err) => {
  assert(err instanceof Error);
  return true;
};

test('makePowerbox() should construct a Powerbox', () => {
  const pb = powerbox.makePowerbox();
  assert.ok(Object.prototype.hasOwnProperty.call(pb, 'request'));
  assert.ok(Object.prototype.hasOwnProperty.call(pb, 'grant'));
  assert.ok(Object.prototype.hasOwnProperty.call(pb, 'revoke'));
});

/** @typedef {{ add: (a: number, b: number) => number }} Adder*/

/** @type Adder */
const adder = {
  add: (a, b) => a + b,
};

const CALLER_ID = 'caller';
const CAP_ID = 'adder';

describe('request()', () => {
  /** @type {Powerbox} */
  const pb = powerbox.makePowerbox();

  test('request() should return UnknownCaller if the caller has not been granted any capabilities', () => {
    const result = pb.request(CALLER_ID, CAP_ID);
    assert.equal(result.tag, 'unknown-caller');
    assert.equal(result.value, null);
  });

  test('request() should return UnavailableCapability if the capability has not been granted', () => {
    pb.grant(CALLER_ID, 'console', console);
    const result = pb.request(CALLER_ID, CAP_ID);
    assert.equal(result.tag, 'unavailable-capability');
    assert.equal(result.value, null);
  });

  test('request() should return the expected object if the capability has been granted', () => {
    pb.grant(CALLER_ID, CAP_ID, adder);
    const result = pb.request(CALLER_ID, CAP_ID);
    assert.equal(result.tag, 'ok');
    const maybeGadder = /** @type {Adder | null} */ (result.value);
    assert.notEqual(maybeGadder, null);
    assert.equal(maybeGadder?.add(2, 2), 4);
  });

  test('request() should return RevokedCapability if the capability has been revoked', () => {
    const revokeResult = pb.revoke(CALLER_ID, CAP_ID);
    assert.equal(revokeResult.tag, 'ok');
    const requestResult = pb.request(CALLER_ID, CAP_ID);
    assert.equal(requestResult.tag, 'revoked-capability');
    const maybeGadder = /** @type {Adder | null} */ (requestResult.value);
    assert.notEqual(maybeGadder, null);
    assert.throws(() => maybeGadder?.add(2, 2), checkError);
  });
});

describe('revoke()', () => {
  /** @type {Powerbox} */
  const pb = powerbox.makePowerbox();

  it('should return UnknownCaller if the caller has not been granted any capabilities', () => {
    const result = pb.revoke(CALLER_ID, CAP_ID);
    assert.equal(result.tag, 'unknown-caller');
  });

  it('should return UnavailableCapability if the capability has not been granted', () => {
    pb.grant(CALLER_ID, 'console', console);
    const result = pb.revoke(CALLER_ID, CAP_ID);
    assert.equal(result.tag, 'unavailable-capability');
  });

  it('should revoke a capability', () => {
    pb.grant(CALLER_ID, CAP_ID, adder);
    const requestResult = pb.request(CALLER_ID, CAP_ID);
    assert.equal(requestResult.tag, 'ok');
    const maybeGadder = /** @type {Adder | null} */ (requestResult.value);
    assert.notEqual(maybeGadder, null);
    const revokeResult = pb.revoke(CALLER_ID, CAP_ID);
    assert.equal(revokeResult.tag, 'ok');
    assert.throws(() => maybeGadder?.add(2, 2), checkError);
  });

  it('should return RevokedCapability if the capability has been revoked', () => {
    const result = pb.revoke(CALLER_ID, CAP_ID);
    assert.equal(result.tag, 'revoked-capability');
  });
});
