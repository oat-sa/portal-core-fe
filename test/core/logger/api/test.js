/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017-2020 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test the logger API
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */

import loggerFactory from 'core/logger/api';

QUnit.module('API');

QUnit.test('module', function(assert) {
    assert.expect(2);

    assert.ok(typeof loggerFactory !== 'undefined', 'The module exports something');
    assert.ok(typeof loggerFactory === 'function', 'The module exposes a function');
});

QUnit.test('register', function(assert) {
    assert.expect(3);

    assert.ok(typeof loggerFactory.register === 'function', 'The module exposes also a register method');

    assert.throws(
        function() {
            loggerFactory.register('foo');
        },
        TypeError,
        'A provider is an object'
    );

    assert.throws(
        function() {
            loggerFactory.register({ foo: function() {} });
        },
        TypeError,
        'A provider is an object with a log method'
    );

    loggerFactory.register({ log: function() {} });
});

QUnit.test('levels', function(assert) {
    assert.expect(13);

    assert.ok(typeof loggerFactory.levels === 'object', 'The module exposes the available levels');

    assert.ok(typeof loggerFactory.levels.fatal === 'number', 'The module exposes a fatal level');
    assert.ok(typeof loggerFactory.levels.error === 'number', 'The module exposes a debug level');
    assert.ok(typeof loggerFactory.levels.warn === 'number', 'The module exposes a warn level');
    assert.ok(typeof loggerFactory.levels.info === 'number', 'The module exposes an info level');
    assert.ok(typeof loggerFactory.levels.debug === 'number', 'The module exposes a debug level');
    assert.ok(typeof loggerFactory.levels.trace === 'number', 'The module exposes a trace level');

    assert.ok(loggerFactory.levels.fatal > loggerFactory.levels.error, 'The fatal level is greater than error');
    assert.ok(loggerFactory.levels.error > loggerFactory.levels.warn, 'The error level is greater than warn');
    assert.ok(loggerFactory.levels.warn > loggerFactory.levels.info, 'The warn level is greater than info');
    assert.ok(loggerFactory.levels.info > loggerFactory.levels.debug, 'The info level is greater than debug');
    assert.ok(loggerFactory.levels.debug > loggerFactory.levels.trace, 'The debug level is greater than trace');
    assert.ok(loggerFactory.levels.trace > 0, 'The error level is greater than warn');
});

QUnit.test('factory', function(assert) {
    assert.expect(4);

    assert.throws(
        function() {
            loggerFactory();
        },
        TypeError,
        'A logger needs a name'
    );

    assert.throws(
        function() {
            loggerFactory({});
        },
        TypeError,
        'A logger needs a name'
    );

    assert.ok(typeof loggerFactory('foo') === 'object', 'The factory creates an object');
    assert.notEqual(loggerFactory('foo'), loggerFactory('foo'), 'The factory creates an new object');
});

QUnit.test('logger instance', function(assert) {
    var logger;
    assert.expect(10);

    logger = loggerFactory('foo');

    assert.equal(typeof logger, 'object', 'The logger should be an object');
    assert.equal(typeof logger.log, 'function', 'The logger has a log method');
    assert.equal(typeof logger.fatal, 'function', 'The logger has a fatal method');
    assert.equal(typeof logger.error, 'function', 'The logger has an error method');
    assert.equal(typeof logger.warn, 'function', 'The logger has a warn method');
    assert.equal(typeof logger.info, 'function', 'The logger has an info method');
    assert.equal(typeof logger.debug, 'function', 'The logger has a debug method');
    assert.equal(typeof logger.trace, 'function', 'The logger has a trace method');

    assert.equal(typeof logger.level, 'function', 'The logger has a level method');
    assert.equal(typeof logger.child, 'function', 'The logger has a child method');
});

QUnit.module('providers', function(hooks) {
    hooks.beforeEach(function() {
        loggerFactory.providers = false;
    });

    QUnit.test('wrong providers', function(assert) {
        var ready = assert.async();
        var p;
        assert.expect(3);

        assert.equal(loggerFactory.providers, false, 'No providers');

        p = loggerFactory.load({ 'test/core/logger/api/test': {} });
        assert.ok(p instanceof Promise, 'the load method returns a Promise');

        p.then(function() {
            assert.ok(false, 'The method should not resolve');
            ready();
        }).catch(function(err) {
            assert.ok(err instanceof Error, 'The given provider is not a logger');
            ready();
        });
    });
});

QUnit.module('logger behavior', {
    beforeEach: function() {
        loggerFactory.providers = [];
    }
});

QUnit.cases
    .init([
        {
            title: 'info text',
            name: 'foo',
            level: 'info',
            args: ['bar'],
            expected: { level: 'info', name: 'foo', msg: 'bar' }
        },
        {
            title: 'warn format',
            name: 'woo',
            level: 'warn',
            args: ['holy %s', 'foo'],
            expected: { level: 'warn', name: 'woo', msg: 'holy foo' }
        },
        {
            title: 'info num format',
            name: 'noo',
            level: 'info',
            args: [{ a: true }, 'hello %d %s', 12, 'bar'],
            expected: { level: 'info', name: 'noo', msg: 'hello 12 bar' }
        },
        {
            title: 'error',
            name: 'eoo',
            level: 'error',
            args: [new Error('oops')],
            expected: { level: 'error', name: 'eoo', msg: 'oops' }
        },
        {
            title: 'error',
            name: 'eoo',
            level: 'error',
            args: [{ a: true }, new TypeError('oops')],
            expected: { level: 'error', name: 'eoo', msg: 'oops' }
        },
        {
            title: 'error',
            name: 'eoo',
            level: 'error',
            args: [{ a: true }, { object: true }],
            expected: { level: 'error', name: 'eoo', msg: JSON.stringify({ object: true }) }
        }
    ])
    .test('message logs ', function(data, assert) {
        var logger;
        assert.expect(9);

        loggerFactory.register({
            log: function log(message) {
                assert.equal(typeof message, 'object', 'the message object is there');
                assert.equal(typeof message.time, 'string', 'the message has a time');
                assert.equal(message.v, 0, 'The format version is consistent');
                assert.equal(message.pid, 1, 'The pid is consistent');

                assert.equal(message.hostname, navigator.userAgent, 'The hostname matches the UA');
                assert.equal(message.level, data.expected.level, 'the level match');
                assert.equal(message.name, data.expected.name, 'The message name match');
                assert.equal(message.msg, data.expected.msg, 'The message match');
                assert.equal(typeof message.msg, 'string', 'The message is string');
            }
        });

        logger = loggerFactory(data.name);
        logger[data.level].apply(logger, data.args);
    });

QUnit.test('minimum level', function(assert) {
    var logger;
    assert.expect(3);

    loggerFactory.register({
        log: function log(message) {
            assert.equal(message.level, 'warn', 'the level match');
            assert.equal(message.msg, 'something', 'the message match');
        }
    });

    logger = loggerFactory('foo', 'warn');

    logger.trace('nothing');
    logger.debug('nothing');
    logger.info('nothing');
    logger.warn('something');

    assert.equal(logger.level(), 'warn', 'The current level match');
});

QUnit.test('default minimum level', function(assert) {
    var logger;
    assert.expect(3);

    loggerFactory.register({
        log: function log(message) {
            assert.equal(message.level, 'warn', 'the level match');
            assert.equal(message.msg, 'something', 'the message match');
        }
    });

    loggerFactory.setDefaultLevel('warn');
    logger = loggerFactory('foo');
    logger.trace('nothing');
    logger.debug('nothing');
    logger.info('nothing');
    logger.warn('something');

    assert.equal(logger.level(), 'warn', 'The current level match');
});

QUnit.test('change minimum level', function(assert) {
    var logger;
    assert.expect(5);

    loggerFactory.register({
        log: function log(message) {
            assert.equal(message.level, 'trace', 'the level match');
            assert.equal(message.msg, 'something', 'the message match');
        }
    });

    logger = loggerFactory('foo', 'warn');
    logger.info('nothing');
    assert.equal(logger.level(), 'warn', 'The current level match');

    logger.level('info');
    assert.equal(logger.level(), 'info', 'The current level match');
    logger.trace('nothing');

    logger.level(loggerFactory.levels.trace);
    assert.equal(logger.level(), 'trace', 'The current level match');
    logger.trace('something');
});

QUnit.test('base fields', function(assert) {
    var logger;
    var moo = {
        a: true,
        b: [1, 12],
        c: {
            borz: new Date()
        }
    };
    assert.expect(3);

    loggerFactory.register({
        log: function log(message) {
            assert.equal(message.foo, 'bar', 'the foo field match');
            assert.equal(message.msg, 'something', 'the level match');
            assert.deepEqual(message.moo, moo, 'the moo field match');
        }
    });

    logger = loggerFactory('foo', loggerFactory.levels.debug, {
        foo: 'bar',
        moo: moo
    });
    logger.trace('nothing');
    logger.debug('something');
});

QUnit.test('optional min level', function(assert) {
    var logger;
    var moo = {
        a: false,
        b: [-1, -12]
    };
    assert.expect(3);

    loggerFactory.register({
        log: function log(message) {
            assert.equal(message.foo, 'bar', 'the foo field match');
            assert.equal(message.msg, 'something', 'the level match');
            assert.deepEqual(message.moo, moo, 'the moo field match');
        }
    });

    logger = loggerFactory('foo', {
        foo: 'bar',
        moo: moo
    });
    logger.trace('nothing');
    logger.warn('something');
});

QUnit.test('fields override', function(assert) {
    var logger;
    assert.expect(4);

    loggerFactory.register({
        log: function log(message) {
            assert.equal(message.msg, 'something', 'the level match');
            assert.equal(message.foo, 'norz', 'the foo field match');
            assert.deepEqual(message.moo, [12], 'the moo field match');
            assert.equal(message.other, 'yeah', 'the other field match');
        }
    });

    logger = loggerFactory('foo', loggerFactory.levels.debug, {
        foo: 'bar',
        moo: {
            a: 24
        }
    });
    logger.trace('nothing');
    logger.debug(
        {
            other: 'yeah',
            foo: 'norz',
            moo: [12]
        },
        'something'
    );
});

QUnit.test('child logger', function(assert) {
    var logger;
    var child;
    assert.expect(13);

    loggerFactory.register({
        log: function log(message) {
            assert.equal(message.msg, 'something', 'the level match');
            assert.equal(message.foo, 'bar', 'the foo field match');
            assert.equal(message.bar, true, 'the bar field match');
        }
    });

    logger = loggerFactory('foo', loggerFactory.levels.debug, {
        foo: 'bar'
    });

    logger.trace('nothing');

    child = logger.child({ bar: true });

    assert.equal(typeof child, 'object', 'The child should be an object');
    assert.equal(typeof child.log, 'function', 'The child has a log method');
    assert.equal(typeof child.fatal, 'function', 'The child has a fatal method');
    assert.equal(typeof child.error, 'function', 'The child has an error method');
    assert.equal(typeof child.warn, 'function', 'The child has a warn method');
    assert.equal(typeof child.info, 'function', 'The child has an info method');
    assert.equal(typeof child.debug, 'function', 'The child has a debug method');
    assert.equal(typeof child.trace, 'function', 'The child has a trace method');
    assert.equal(typeof child.level, 'function', 'The child has a level method');
    assert.equal(typeof child.child, 'function', 'The child has a child method');
    child.debug('something');
});
