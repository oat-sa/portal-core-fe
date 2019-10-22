/**
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Unit test the baseUrl helper {@link core/baseUrl}
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 *
 */

import baseUrl from '../../../src/helper/baseUrl';


QUnit.module('API');

QUnit.test('module', assert => {
    assert.expect(1);
    assert.equal(typeof baseUrl, 'function', 'The module exposes a function');
});

QUnit.test('base url', assert => {
    assert.expect(9);
    assert.equal(baseUrl(), '/', 'The base url is returned');
    assert.equal(baseUrl('/test'), '/test', 'The url is completed with the base url');
    assert.equal(baseUrl('http://abc.def'), 'http://abc.def', 'The full url is not altered');

    const state = window.history.state;
    const originUrl = window.location.pathname;
    const devBase = '/app_dev.php';
    const prodBase = '/app.php';
    const devUrl = devBase + originUrl;
    const prodUrl = prodBase + originUrl;

    window.history.replaceState({ url : devUrl }, 'Dev Env', devUrl);
    assert.equal(baseUrl(), devBase + '/', 'The dev mode base url is returned');
    assert.equal(baseUrl('/test'), devBase + '/test', 'The url is completed with the dev mode base url');
    assert.equal(baseUrl('http://abc.def'), 'http://abc.def', 'The full url is not altered in explicit dev mode');


    window.history.replaceState({ url : prodUrl }, 'Prod Env', prodUrl);
    assert.equal(baseUrl(), prodBase + '/', 'The prod mode base url is returned');
    assert.equal(baseUrl('/test'), prodBase + '/test', 'The url is completed with the prod mode base url');
    assert.equal(baseUrl('http://abc.def'), 'http://abc.def', 'The full url is not altered in explicit prod mode');

    window.history.replaceState(state, '', originUrl);
});
