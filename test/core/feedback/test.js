/**
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
import { message, info, success, warning, danger, error} from 'depp/core/feedback/feedback';

QUnit.config.reorder = false;
QUnit.module('API');

QUnit.test('module', assert => {
    assert.equal(typeof message, 'function', "The module exposes a message function");
    assert.equal(typeof info, 'function', "The module exposes a message function");
    assert.equal(typeof success, 'function', "The module exposes a message function");
    assert.equal(typeof warning, 'function', "The module exposes a message function");
    assert.equal(typeof danger, 'function', "The module exposes a message function");
    assert.equal(typeof error, 'function', "The module exposes a message function");
});

QUnit.test('component', assert => {
    const feedback = message('info', 'Yop');

    assert.equal(typeof feedback, 'object', "The function returns the component");
    assert.equal(typeof feedback.on, 'function', "The component has the on method");
    assert.equal(typeof feedback.off, 'function', "The component has the off method");
    assert.equal(typeof feedback.trigger, 'function', "The component has the trigger method");
    assert.equal(typeof feedback.init, 'function', "The component has the init method");
    assert.equal(typeof feedback.render, 'function', "The component has the render method");
    assert.equal(typeof feedback.destroy, 'function', "The component has the destroy method");
    assert.equal(typeof feedback.open, 'function', "The component has the open method");
    assert.equal(typeof feedback.close, 'function', "The component has the close method");
});

QUnit.module('Messages');

QUnit.test('info rendering', assert => {
    const done = assert.async();
    const container = document.getElementById('feedbacks');

    assert.ok(container instanceof HTMLElement);
    assert.equal(container.children.length, 0);

    info('Hello world')
        .on('render', function() {
            const elt = this.getElement()[0];
            assert.ok(elt.classList.contains('alert'));
            assert.ok(elt.classList.contains('alert-info'));
            assert.ok(elt.classList.contains('rendered'));
            assert.equal(elt.querySelector('div').textContent.trim(), 'Hello world', 'The content matches');
            assert.ok(this.is('rendered'), 'The component is in a rendered state');
            assert.ok(!this.is('open'), 'The component is not yet opened');
        })
        .on('open', function() {
            const elt = this.getElement()[0];
            const closeElt = elt.querySelector('.close');
            assert.ok(closeElt instanceof HTMLElement);
            assert.ok(this.is('open'), 'The component is now opened');
            closeElt.click();
        })
        .on('close', function(){
            assert.ok( !this.is('open'), 'The component is not opened anymore');

            this.destroy();
        })
        .on('destroy', function(){
            this.off('destroy');
            done();
        });
});

QUnit.test('short success', assert => {
    const done = assert.async();
    const container = document.getElementById('feedbacks');

    assert.ok(container instanceof HTMLElement);
    assert.equal(container.children.length, 0);

    success('awesome', { timeout : 400 })
        .on('render', function() {
            const elt = this.getElement()[0];
            assert.ok(elt.classList.contains('alert'));
            assert.ok(elt.classList.contains('alert-success'));
            assert.ok(elt.classList.contains('rendered'));
            assert.equal(elt.querySelector('div').textContent.trim(), 'awesome', 'The content matches');
            assert.ok(this.is('rendered'), 'The component is in a rendered state');
            assert.ok(!this.is('open'), 'The component is not yet opened');
        })
        .on('open', function() {
            const elt = this.getElement()[0];
            const closeElt = elt.querySelector('.close');
            assert.ok(closeElt instanceof HTMLElement);
            assert.ok(this.is('open'), 'The component is now opened');
            setTimeout( () => assert.ok(this.is('open'), 'The component is still opened'), 150);
            setTimeout( () => {
                assert.ok( ! this.is('open'), 'The component is now closed'),
                this.destroy();
            }, 500);
        })
        .on('destroy', function(){
            this.off('destroy');
            done();
        });
});

QUnit.test('warning with overlay', assert => {
    const done = assert.async();
    const container = document.getElementById('feedbacks');
    const overlay = document.getElementById('overlay');

    assert.ok(container instanceof HTMLElement);
    assert.equal(container.children.length, 0);
    assert.ok(overlay instanceof HTMLElement);
    assert.ok(overlay.classList.contains('hidden'), 'The overlay starts hidden');

    warning('be careful', { overlay : true })
        .on('render', function() {
            const elt = this.getElement()[0];
            assert.ok(elt.classList.contains('alert'));
            assert.ok(elt.classList.contains('alert-warning'));
            assert.ok(elt.classList.contains('rendered'));
            assert.equal(elt.querySelector('div').textContent.trim(), 'be careful', 'The content matches');
            assert.ok(this.is('rendered'), 'The component is in a rendered state');
            assert.ok(!this.is('open'), 'The component is not yet opened');
        })
        .on('open', function() {
            const elt = this.getElement()[0];
            const closeElt = elt.querySelector('.close');
            assert.ok(closeElt instanceof HTMLElement);
            assert.ok(this.is('open'), 'The component is now opened');
            assert.ok( ! overlay.classList.contains('hidden'), 'The ovelay is shown');

            closeElt.click();
        })
        .on('close', function() {
            assert.ok( ! this.is('open'), 'The component is closed');
            assert.ok(overlay.classList.contains('hidden'), 'The overlay is hidden back');
            this.destroy();
        })
        .on('destroy', function(){
            this.off('destroy');
            done();
        });
});


QUnit.test('structured error', assert => {
    const done = assert.async();
    const container = document.getElementById('feedbacks');

    assert.ok(container instanceof HTMLElement);
    assert.equal(container.children.length, 0);

    error({ title : 'Something went wrong', content: 'Unable to contact the server'})
        .on('render', function() {
            const elt = this.getElement()[0];
            assert.ok(elt.classList.contains('alert'));
            assert.ok(elt.classList.contains('alert-danger'));
            assert.ok(elt.classList.contains('rendered'));

            assert.equal(elt.querySelector('div').textContent.replace(/\s+/g, ' ').trim(), 'Something went wrong Unable to contact the server', 'The content matches');
            assert.equal(elt.querySelector('div > strong').textContent.trim(), 'Something went wrong', 'The title matches');
            assert.ok(this.is('rendered'), 'The component is in a rendered state');
            assert.ok(!this.is('open'), 'The component is not yet opened');
        })
        .on('open', function() {
            assert.ok(this.is('open'), 'The component is now opened');
            this.close();
        })
        .on('close', function() {
            assert.ok( ! this.is('open'), 'The component is closed');
            this.destroy();
        })
        .on('destroy', function(){
            this.off('destroy');
            done();
        });
});
