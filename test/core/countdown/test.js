/**
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Unit test the countdownFactory helper {@link core/countdownFactory}
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 *
 */

import countdownFactory from '../../../src/core/countdown';


QUnit.module('API');

QUnit.test('module', assert => {
    assert.expect(1);
    assert.equal(typeof countdownFactory, 'function', 'The module exposes a function');
});

QUnit.test('factory', assert => {
    assert.expect(2);
    assert.equal(typeof countdownFactory(), 'object', 'The function creates an object');
    assert.notDeepEqual(countdownFactory(), countdownFactory(), 'The function creates a unique object');
});

QUnit.test('instance', assert => {
    const countdown = countdownFactory();
    assert.expect(7);
    assert.equal(typeof countdown.remaining, 'number', 'The instance exposes the remaining property');
    assert.equal(typeof countdown.config, 'object', 'The instance exposes the config property');
    assert.equal(typeof countdown.state, 'string', 'The instance exposes the state property');
    assert.equal(typeof countdown.pause, 'function', 'The instance exposes the pause method');
    assert.equal(typeof countdown.reset, 'function', 'The instance exposes the reset method');
    assert.equal(typeof countdown.start, 'function', 'The instance exposes the start method');
    assert.equal(typeof countdown.cancel, 'function', 'The instance exposes the cancel method');

});

QUnit.test('eventifier', assert => {
    const countdown = countdownFactory();
    assert.expect(5);
    assert.equal(typeof countdown.on, 'function', 'The instance exposes the on method');
    assert.equal(typeof countdown.off, 'function', 'The instance exposes the off method');
    assert.equal(typeof countdown.before, 'function', 'The instance exposes the before method');
    assert.equal(typeof countdown.after, 'function', 'The instance exposes the after method');
    assert.equal(typeof countdown.trigger, 'function', 'The instance exposes the trigger method');
});

QUnit.module('Behavior');

QUnit.test('start', function (assert) {

    let timer = 10;
    const done = assert.async();
    const instance = countdownFactory(timer, {interval: 100})
        .on('start', remaining => {
            assert.ok(true, 'The start event has been triggered');
            assert.equal(remaining, timer, 'The remaining time is as expected');
            assert.equal(instance.state, 'running', 'The instance is running');
        })
        .on('tick', remaining => {
            assert.ok(true, 'Update triggered');
            assert.equal(remaining, --timer, 'The remaining time is as expected');
        })
        .on('done', () => {
            assert.equal(instance.state, 'done', 'State is done');
            assert.equal(instance.remaining, 0, 'Time is elapsed');
            assert.ok(true, 'Countdown is done');
            done();
        });

    assert.expect(29);

    assert.equal(instance.state, 'paused', 'The instance is paused');
    assert.equal(instance.remaining, timer, 'The remaining time has not changed');
    assert.equal(instance.start(), instance, 'The start method returns the instance');
});

QUnit.test('done', function (assert) {

    const done = assert.async();
    const instance = countdownFactory()
        .on('start', () => {
            assert.ok(false, 'The countdown should not start');
        })
        .on('tick', () => {
            assert.ok(false, 'The countdown should not start');
        })
        .on('done', () => {
            assert.equal(instance.state, 'done', 'State is done');
            assert.equal(instance.remaining, 0, 'Time is elapsed');
            assert.ok(true, 'Countdown is done');
            done();
        });

    assert.expect(6);

    assert.equal(instance.state, 'paused', 'The instance is paused');
    assert.equal(instance.remaining, 0, 'The remaining time has not changed');
    assert.equal(instance.start(), instance, 'The start method returns the instance');
});

QUnit.test('auto start', function (assert) {

    let timer = 10;
    const done = assert.async();
    const instance = countdownFactory(timer, {interval: 100, autoStart: true})
        .on('start', remaining => {
            assert.ok(true, 'The start event has been triggered');
            assert.equal(remaining, timer, 'The remaining time is as expected');
            assert.equal(instance.state, 'running', 'The instance is running');
        })
        .on('tick', remaining => {
            assert.ok(true, 'Update triggered');
            assert.equal(remaining, --timer, 'The remaining time is as expected');
        })
        .on('done', () => {
            assert.equal(instance.state, 'done', 'State is done');
            assert.equal(instance.remaining, 0, 'Time is elapsed');
            assert.ok(true, 'Countdown is done');
            done();
        });

    assert.expect(28);

    assert.equal(instance.state, 'paused', 'The instance is paused');
    assert.equal(instance.remaining, timer, 'The remaining time has not changed');
});

QUnit.test('pause', function (assert) {

    let timer = 10;
    const done = assert.async();
    const instance = countdownFactory(timer, {interval: 100})
        .on('start', remaining => {
            assert.ok(true, 'The start event has been triggered');
            assert.equal(remaining, timer, 'The remaining time is as expected');
            assert.equal(instance.state, 'running', 'The instance is running');
        })
        .on('tick', remaining => {
            assert.ok(true, 'Update triggered');
            assert.equal(remaining, --timer, 'The remaining time is as expected');
        })
        .on('pause', remaining => {
            assert.equal(instance.state, 'paused', 'State is paused');
            assert.equal(remaining, 6, 'Time is frozen');
            assert.equal(instance.remaining, 6, 'Time is frozen');
            assert.ok(true, 'Countdown is paused');

            setTimeout(() => {
                instance.start();
            }, 200);
        })
        .on('done', () => {
            assert.equal(instance.state, 'done', 'State is done');
            assert.equal(instance.remaining, 0, 'Time is elapsed');
            assert.ok(true, 'Countdown is done');
            done();
        });

    assert.expect(37);

    assert.equal(instance.state, 'paused', 'The instance is paused');
    assert.equal(instance.remaining, timer, 'The remaining time has not changed');
    assert.equal(instance.start(), instance, 'The start method returns the instance');

    setTimeout(() => {
        assert.equal(instance.pause(), instance, 'The pause method returns the instance');
    }, 450);
});

QUnit.test('reset', function (assert) {

    let timer = 10;
    const done = assert.async();
    const instance = countdownFactory(timer, {interval: 100, autoStart: true})
        .on('start', remaining => {
            assert.ok(true, 'The start event has been triggered');
            assert.equal(remaining, timer, 'The remaining time is as expected');
            assert.equal(instance.state, 'running', 'The instance is running');
        })
        .on('tick', remaining => {
            assert.ok(true, 'Update triggered');
            assert.equal(remaining, --timer, 'The remaining time is as expected');
        })
        .on('pause', remaining => {
            assert.equal(instance.state, 'paused', 'State is paused');
            assert.equal(remaining, 6, 'Time is frozen');
            assert.equal(instance.remaining, 6, 'Time is frozen');
            assert.ok(true, 'Countdown is paused');

            setTimeout(() => {
                timer = 4;
                assert.equal(instance.reset(timer), instance, 'The reset method returns the instance');
            }, 200);
        })
        .on('reset', remaining => {
            assert.equal(instance.state, 'paused', 'State is paused');
            assert.equal(instance.remaining, timer, 'The remaining time has been changed');
            assert.equal(remaining, timer, 'The remaining time has been changed');
            assert.ok(true, 'Countdown is reset');
        })
        .on('done', () => {
            assert.equal(instance.state, 'done', 'State is done');
            assert.equal(instance.remaining, 0, 'Time is elapsed');
            assert.ok(true, 'Countdown is done');
            done();
        });

    assert.expect(37);

    assert.equal(instance.state, 'paused', 'The instance is paused');
    assert.equal(instance.remaining, timer, 'The remaining time has not changed');

    setTimeout(() => {
        assert.equal(instance.pause(), instance, 'The pause method returns the instance');
    }, 450);
});

QUnit.test('cancel', function (assert) {

    let timer = 10;
    const done = assert.async();
    const instance = countdownFactory(timer, {interval: 100})
        .on('start', remaining => {
            assert.ok(true, 'The start event has been triggered');
            assert.equal(remaining, timer, 'The remaining time is as expected');
            assert.equal(instance.state, 'running', 'The instance is running');
        })
        .on('tick', remaining => {
            assert.ok(true, 'Update triggered');
            assert.equal(remaining, --timer, 'The remaining time is as expected');
        })
        .on('cancel', remaining => {
            assert.equal(instance.state, 'canceled', 'State is canceled');
            assert.equal(instance.remaining, 6, 'Time is frozen');
            assert.equal(remaining, 6, 'Time is frozen');
            assert.ok(true, 'Countdown is canceled');
            done();
        })
        .on('done', () => {
            assert.ok(false, 'Countdown should not be done');
            done();
        });

    assert.expect(19);

    assert.equal(instance.state, 'paused', 'The instance is paused');
    assert.equal(instance.remaining, timer, 'The remaining time has not changed');
    assert.equal(instance.start(), instance, 'The start method returns the instance');

    setTimeout(() => {
        assert.equal(instance.cancel(), instance, 'The cancel method returns the instance');
    }, 450);
});