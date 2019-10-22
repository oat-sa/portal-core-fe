/**
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
import corsHelper from '../../../src/helper/cors';

QUnit.config.reorder = false;
QUnit.module('API');

QUnit.test('module', assert => {
    assert.equal(typeof corsHelper, 'object', "The module exposes an object");
    assert.equal(typeof corsHelper.credentialsForUrl, 'function', 'The helper has a method credentialsForUrl');
});

QUnit.module('Behavior');

QUnit.test('credentials', assert => {
    assert.equal(corsHelper.credentialsForUrl('http://fake.other.domain.com/foo/bar?wesh=blurp'), 'omit', 'Other domain should be discarded');
    assert.equal(corsHelper.credentialsForUrl(`http://${document.domain}/foo/bar?bar=yo`), 'same-origin', 'Same domain');
    assert.equal(corsHelper.credentialsForUrl(`/foo/bar?bar=yo`), 'same-origin', 'Same domain');
    assert.equal(corsHelper.credentialsForUrl(`http://trololo.${document.domain}/foo/bar?bar=yo`), 'include', 'Sub domain');
    assert.equal(corsHelper.credentialsForUrl(`http://evil.on.earth.com/${document.domain}/foo/bar?bar=yo`), 'omit', 'Injection 1');
    assert.equal(corsHelper.credentialsForUrl(`http://evil.on.earth.com#${document.domain}/foo/bar?bar=yo`), 'omit', 'Injection 2');
});