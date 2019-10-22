/**
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

import _ from 'lodash';
import $ from 'jquery';
import downloadHelper from '../../../src/helper/download';
import fixturesTpl from './fixtures.tpl';

QUnit.config.reorder = false;
QUnit.module('API');

QUnit.test('module', assert => {
    assert.equal(typeof downloadHelper, 'object', "The module exposes an object");
    assert.equal(typeof downloadHelper.watch, 'function', 'The helper has a method watch');
    assert.equal(typeof downloadHelper.manageLink, 'function', 'The helper has a method manageLink');
});

QUnit.module('Behavior');

QUnit.test('watch - success', assert => {
    const done = assert.async();
    const token = Date.now();
    const cookieName = `cookie${_.uniqueId()}`;
    const reCookie = new RegExp(`${cookieName}=([\\d]+)`);
    assert.ok(!reCookie.test(document.cookie || ''), 'No cookie is set right now');

    downloadHelper.watch(token, {interval: 100, timeout: 1000, cookieName})
        .then(() => {
            assert.ok(true, 'The promise have been resolved');
        })
        .catch(() => {
            assert.ok(false, 'The promise should not fail');
        })
        .then(() => {
            assert.ok(!reCookie.test(document.cookie || ''), 'The cookie is now removed');
            done();
        });

    document.cookie = `${cookieName}=${token}`;
});

QUnit.test('watch - success - several cookies', assert => {
    const done = assert.async();
    const token = Date.now();
    const cookieName = `cookie${_.uniqueId()}`;
    const reCookie = new RegExp(`${cookieName}=([\\d]+)`);
    assert.ok(!reCookie.test(document.cookie || ''), 'No cookie is set right now');

    downloadHelper.watch(token, {interval: 100, timeout: 1000, cookieName})
        .then(() => {
            assert.ok(true, 'The promise have been resolved');
        })
        .catch(() => {
            assert.ok(false, 'The promise should not fail');
        })
        .then(() => {
            document.cookie = `${cookieName}=foo; path=/; expires=0`;
            document.cookie = `${cookieName}=bar; path=/foo; expires=0`;
            assert.ok(!reCookie.test(document.cookie || ''), 'The cookie is now removed');
            done();
        });

    document.cookie = `${cookieName}=${token}`;
    document.cookie = `${cookieName}=foo; path=/`;
    document.cookie = `${cookieName}=bar; path=/foo`;
});

QUnit.test('watch - failure', assert => {
    const done = assert.async();
    const token = Date.now();
    const cookieName = `cookie${_.uniqueId()}`;
    const reCookie = new RegExp(`${cookieName}=([\\d]+)`);
    assert.ok(!reCookie.test(document.cookie || ''), 'No cookie is set right now');

    downloadHelper.watch(token, {interval: 100, timeout: 300, cookieName})
        .then(() => {
            assert.ok(false, 'The promise should not succeed');
        })
        .catch(() => {
            assert.ok(true, 'The promise has failed');
        })
        .then(() => {
            assert.ok(!reCookie.test(document.cookie || ''), 'The cookie is now removed');
            done();
        });
});

QUnit.test('manageLink - success', assert => {
    const done = assert.async();
    const token = Date.now();
    const param = 'prm';
    const url = `http://test.local/foo?${param}=${token}`;
    const cookieName = `cookie${_.uniqueId()}`;
    const event = 'fooBar';
    const reCookie = new RegExp(`${cookieName}=([\\d]+)`);
    const reParam = new RegExp(`${param}=([\\d]+)`);
    const $fixture = $(fixturesTpl({url}));

    assert.ok(!reCookie.test(document.cookie || ''), 'No cookie is set right now');

    $fixture.on(event, () => assert.ok(true, 'The event has been triggered'));

    downloadHelper.manageLink($fixture, {interval: 100, timeout: 1000, cookieName, param, event})
        .then(() => {
            assert.ok(true, 'The promise have been resolved');
        })
        .catch(() => {
            assert.ok(false, 'The promise should not fail');
        })
        .then(() => {
            const [, query] = $fixture.attr('href').split('?');
            const paramMatch = query.match(reParam);
            assert.ok(Array.isArray(paramMatch) && paramMatch.length, 'A token is still in the link');
            assert.notEqual(paramMatch.pop(), `${token}`, 'The token has been changed in the link');
            assert.ok(!reCookie.test(document.cookie || ''), 'The cookie is now removed');
            done();
        });

    document.cookie = `${cookieName}=${token}`;
});

QUnit.test('manageLink - failure', assert => {
    const done = assert.async();
    const token = Date.now();
    const param = 'prm';
    const url = `http://test.local/foo?${param}=${token}`;
    const cookieName = `cookie${_.uniqueId()}`;
    const event = 'fooBar';
    const reCookie = new RegExp(`${cookieName}=([\\d]+)`);
    const reParam = new RegExp(`${param}=([\\d]+)`);
    const $fixture = $(fixturesTpl({url}));

    assert.ok(!reCookie.test(document.cookie || ''), 'No cookie is set right now');

    $fixture.on(event, () => assert.ok(false, 'The event should not be triggered'));

    downloadHelper.manageLink($fixture, {interval: 100, timeout: 300, cookieName, param, event})
        .then(() => {
            assert.ok(false, 'The promise should not succeed');
        })
        .catch(() => {
            assert.ok(true, 'The promise has failed');
        })
        .then(() => {
            const [, query] = $fixture.attr('href').split('?');
            const paramMatch = query.match(reParam);
            assert.ok(Array.isArray(paramMatch) && paramMatch.length, 'A token is still in the link');
            assert.equal(paramMatch.pop(), `${token}`, 'The token has not been changed in the link');
            assert.ok(!reCookie.test(document.cookie || ''), 'The cookie is now removed');
            done();
        });
});

QUnit.test('manageLink - no token', assert => {
    const done = assert.async();
    const param = 'prm';
    const url = `http://test.local/foo`;
    const cookieName = `cookie${_.uniqueId()}`;
    const event = 'fooBar';
    const reCookie = new RegExp(`${cookieName}=([\\d]+)`);
    const $fixture = $(fixturesTpl({url}));

    assert.ok(!reCookie.test(document.cookie || ''), 'No cookie is set right now');

    $fixture.on(event, () => assert.ok(false, 'The event should not be triggered'));

    downloadHelper.manageLink($fixture, {interval: 100, timeout: 300, cookieName, param, event})
        .then(() => {
            assert.ok(false, 'The promise should not succeed');
        })
        .catch(() => {
            assert.ok(true, 'The promise has failed');
        })
        .then(() => {
            const [, query] = $fixture.attr('href').split('?');
            assert.equal(typeof query, "undefined", 'The token has not been changed in the link');
            assert.ok(!reCookie.test(document.cookie || ''), 'The cookie is now removed');
            done();
        });
});

QUnit.test('manageLink - empty link', assert => {
    const done = assert.async();
    const param = 'prm';
    const url = '';
    const cookieName = `cookie${_.uniqueId()}`;
    const event = 'fooBar';
    const reCookie = new RegExp(`${cookieName}=([\\d]+)`);
    const $fixture = $(fixturesTpl({url}));

    assert.ok(!reCookie.test(document.cookie || ''), 'No cookie is set right now');

    $fixture.on(event, () => assert.ok(false, 'The event should not be triggered'));

    downloadHelper.manageLink($fixture, {interval: 100, timeout: 300, cookieName, param, event})
        .then(() => {
            assert.ok(false, 'The promise should not succeed');
        })
        .catch(() => {
            assert.ok(true, 'The promise has failed');
        })
        .then(() => {
            const [, query] = $fixture.attr('href').split('?');
            assert.equal(typeof query, "undefined", 'The token has not been changed in the link');
            assert.ok(!reCookie.test(document.cookie || ''), 'The cookie is now removed');
            done();
        });
});

QUnit.test('manageLink - no link', assert => {
    const done = assert.async();
    const param = 'prm';
    const cookieName = `cookie${_.uniqueId()}`;
    const event = 'fooBar';
    const reCookie = new RegExp(`${cookieName}=([\\d]+)`);
    const $fixture = $(fixturesTpl());

    assert.ok(!reCookie.test(document.cookie || ''), 'No cookie is set right now');

    $fixture.on(event, () => assert.ok(false, 'The event should not be triggered'));
    $fixture.removeAttr('href');

    downloadHelper.manageLink($fixture, {interval: 100, timeout: 300, cookieName, param, event})
        .then(() => {
            assert.ok(false, 'The promise should not succeed');
        })
        .catch(() => {
            assert.ok(true, 'The promise has failed');
        })
        .then(() => {
            assert.equal(typeof $fixture.attr('href'), "undefined", 'The token has not been changed in the link');
            assert.ok(!reCookie.test(document.cookie || ''), 'The cookie is now removed');
            done();
        });
});
