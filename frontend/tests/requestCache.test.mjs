import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequestCache} from '../src/api/requestCache.ts';

test('concurrent reads share a request, even without caching', async () => {
  const cache = createRequestCache();
  let calls = 0;
  const load = async () => ++calls;
  assert.deepEqual(await Promise.all([
    cache.read('/profile', load),
    cache.read('/profile', load),
  ]), [1, 1]);
  assert.equal(await cache.read('/profile', load), 2);
});

test('responses expire from completion time', async () => {
  let now = 0;
  const cache = createRequestCache(() => now);
  let calls = 0;
  const load = async () => {
    now += 10;
    return ++calls;
  };
  assert.equal(await cache.read('/recommendations', load, 100), 1);
  now = 109;
  assert.equal(await cache.read('/recommendations', load, 100), 1);
  now = 110;
  assert.equal(await cache.read('/recommendations', load, 100), 2);
});

test('failed requests are not cached and can be retried', async () => {
  const cache = createRequestCache();
  await assert.rejects(cache.read('/profile', async () => {
    throw new Error('Unavailable');
  }, 1000), /Unavailable/);
  assert.equal(await cache.read('/profile', async () => 'saved', 1000), 'saved');
});

test('invalidation clears responses after a mutation or account change', async () => {
  const cache = createRequestCache();
  await cache.read('/profile', async () => 'old user', 1000);
  cache.clear();
  assert.equal(await cache.read('/profile', async () => 'new user', 1000), 'new user');
});

test('an old response cannot overwrite a newer response after invalidation', async () => {
  const cache = createRequestCache();
  const deferred = Promise.withResolvers();
  const oldRequest = cache.read('/recommendations', () => deferred.promise, 1000);
  cache.clear();
  await cache.read('/recommendations', async () => 'updated', 1000);
  deferred.resolve('outdated');
  assert.equal(await oldRequest, 'outdated');
  assert.equal(await cache.read('/recommendations', async () => 'unexpected', 1000), 'updated');
});

test('an invalidated request cannot remove a newer pending request', async () => {
  const cache = createRequestCache();
  const old = Promise.withResolvers();
  const fresh = Promise.withResolvers();
  const first = cache.read('/recommendations', () => old.promise, 1000);
  cache.clear();
  const second = cache.read('/recommendations', () => fresh.promise, 1000);
  old.resolve('old');
  await first;
  const third = cache.read('/recommendations', async () => 'unexpected', 1000);
  fresh.resolve('fresh');
  assert.deepEqual(await Promise.all([second, third]), ['fresh', 'fresh']);
});
