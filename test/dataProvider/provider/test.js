/**
 * Copyright (c) 2018-2019 (original work) Open Assessment Technologies SA ;
 */

import dataProvider from 'portal/dataProvider/provider';

/**
 * Unit test the module {@link dataProvider/provider}
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 *
 */

const baseUrl = '/test/dataProvider/provider/data';
const testUrl = `${baseUrl}/data.json`;

QUnit.module('API');

QUnit.test('module', assert => {
    assert.equal(typeof dataProvider, 'function', 'The module exports a function');
});

QUnit.test('parameters', assert => {
    assert.throws( () => dataProvider(), TypeError, 'The function throws without an url');
    assert.throws( () => dataProvider(''), TypeError, 'The function throws without an empty url');
    assert.throws( () => dataProvider(12), TypeError, 'The function throws without an wrong url');
    assert.throws( () => dataProvider(testUrl, 'DELETE'), TypeError, 'The function does not support this method');
    assert.throws( () => dataProvider(testUrl, 'HEAD'), TypeError, 'The function does not support this method');
    assert.throws( () => dataProvider(testUrl, 'PUT'), TypeError, 'The function does not support this method');
    assert.throws( () => dataProvider(testUrl, 'OPTIONS'), TypeError, 'The function does not support this method');

    assert.throws( () => dataProvider(testUrl, {method: 'DELETE'}), TypeError, 'The function does not support this method');
    assert.throws( () => dataProvider(testUrl, {method: 'HEAD'}), TypeError, 'The function does not support this method');
    assert.throws( () => dataProvider(testUrl, {method: 'PUT'}), TypeError, 'The function does not support this method');
    assert.throws( () => dataProvider(testUrl, {method: 'OPTIONS'}), TypeError, 'The function does not support this method');

    let p = dataProvider(testUrl, 'GET');

    assert.ok( p instanceof Promise, 'The provider returns always a promise');
});


QUnit.module('Behavior');

QUnit.test('get JSON', assert => {

    const done = assert.async();

    dataProvider(testUrl)
        .then( results => {

            assert.equal(typeof results, 'object', 'The provider answers with a javascript object');
            done();
        })
        .catch( err => assert.ok(false, err.message));
});

QUnit.test('404', assert => {

    const done = assert.async();

    dataProvider(`${baseUrl}/foo.json`)
        .then( () => assert.ok(false, 'The provider should not resolve'))
        .catch( err => {
            assert.ok(err instanceof Error, 'The provider rejects with an Error');
            assert.equal(err.code, 404, 'The not found code is set');
            assert.equal(err.message, 'Not Found', 'The status is set as the message');
            done();
        });
});


