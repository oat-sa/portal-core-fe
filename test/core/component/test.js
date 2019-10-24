/**
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Unit test the core component factory {@link core/component/component}
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 *
 */

import $ from 'jquery';
import componentFactory from 'portal/core/component/component';


QUnit.module('API');

QUnit.test('module', assert => {
    assert.expect(1);
    assert.equal(typeof componentFactory, 'function', 'The module exposes a function');
});

QUnit.test('factory', assert => {
    assert.expect(2);
    assert.equal(typeof componentFactory(), 'object', 'The function creates an object');
    assert.notDeepEqual(componentFactory(), componentFactory(), 'The function creates a unique object');
});

QUnit.test('component', assert => {
    const testBook = componentFactory();
    assert.expect(15);
    assert.equal(typeof testBook.init, 'function', 'The component exposes the init method');
    assert.equal(typeof testBook.render, 'function', 'The component exposes the render method');
    assert.equal(typeof testBook.destroy, 'function', 'The component exposes the destroy method');
    assert.equal(typeof testBook.setSize, 'function', 'The component exposes the setSize method');
    assert.equal(typeof testBook.show, 'function', 'The component exposes the show method');
    assert.equal(typeof testBook.hide, 'function', 'The component exposes the hide method');
    assert.equal(typeof testBook.enable, 'function', 'The component exposes the enable method');
    assert.equal(typeof testBook.disable, 'function', 'The component exposes the disable method');
    assert.equal(typeof testBook.is, 'function', 'The component exposes the is method');
    assert.equal(typeof testBook.setState, 'function', 'The component exposes the setState method');
    assert.equal(typeof testBook.getContainer, 'function', 'The component exposes the getContainer method');
    assert.equal(typeof testBook.getElement, 'function', 'The component exposes the getElement method');
    assert.equal(typeof testBook.getTemplate, 'function', 'The component exposes the getTemplate method');
    assert.equal(typeof testBook.setTemplate, 'function', 'The component exposes the setTemplate method');
    assert.equal(typeof testBook.getConfig, 'function', 'The component exposes the getConfig method');

});

QUnit.test('eventifier', assert => {
    const testBook = componentFactory();
    assert.expect(5);
    assert.equal(typeof testBook.on, 'function', 'The component exposes the on method');
    assert.equal(typeof testBook.off, 'function', 'The component exposes the off method');
    assert.equal(typeof testBook.before, 'function', 'The component exposes the before method');
    assert.equal(typeof testBook.after, 'function', 'The component exposes the after method');
    assert.equal(typeof testBook.trigger, 'function', 'The component exposes the trigger method');
});


QUnit.module('Component Behavior');

QUnit.test('init', function (assert) {
    const specs = {
        value: 10,
        method: function () {

        }
    };
    const defaults = {
        label: 'a label'
    };
    const config = {
        nothing: undefined,
        dummy: null,
        title: 'My Title'
    };
    const instance = componentFactory(specs, defaults).init(config);

    assert.expect(10);

    assert.notEqual(instance, specs, 'The component instance must not be the same obect as the list of specs');
    assert.notEqual(instance.config, config, 'The component instance must duplicate the config set');
    assert.equal(instance.hasOwnProperty('nothing'), false, 'The component instance must not accept undefined config properties');
    assert.equal(instance.hasOwnProperty('dummy'), false, 'The component instance must not accept null config properties');
    assert.equal(instance.hasOwnProperty('value'), false, 'The component instance must not accept properties from the list of specs');
    assert.equal(instance.config.title, config.title, 'The component instance must catch the title config');
    assert.equal(instance.config.label, defaults.label, 'The component instance must set the label config');
    assert.equal(instance.is('rendered'), false, 'The component instance must not be rendered');
    assert.equal(typeof instance.method, 'function', 'The component instance must have the functions provided in the list of specs');
    assert.notEqual(instance.method, specs.method, 'The component instance must have created a delegate of the functions provided in the list of specs');

    instance.destroy();
});

QUnit.test('render', function (assert) {
    const $dummy1 = $('<div class="dummy" />');
    const $dummy2 = $('<div class="dummy" />');
    const template = '<div class="my-component">TEST</div>';
    const renderedTemplate = '<div class="my-component rendered">TEST</div>';
    const $container1 = $('#fixture-1').append($dummy1);
    const $container2 = $('#fixture-2').append($dummy2);
    const $container3 = $('#fixture-3');

    assert.expect(30);

    // auto render at init
    assert.equal($container1.children().length, 1, 'The container1 already contains an element');
    assert.equal($container1.children().get(0), $dummy1.get(0), 'The container1 contains the dummy element');
    assert.equal($container1.find('.dummy').length, 1, 'The container1 contains an element of the class dummy');

    let instance = componentFactory().init({
        renderTo: $container1,
        replace: true
    });

    assert.equal($container1.find('.dummy').length, 0, 'The container1 does not contain an element of the class dummy');
    assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
    assert.equal(typeof instance.getElement(), 'object', 'The component instance returns the rendered content as an object');
    assert.equal(instance.getElement().length, 1, 'The component instance returns the rendered content');
    assert.equal(instance.getElement().parent().get(0), $container1.get(0), 'The component instance is rendered inside the right container');

    instance.destroy();

    assert.equal($container1.children().length, 0, 'The container1 is now empty');
    assert.equal(instance.getElement(), null, 'The component instance has removed its rendered content');

    // explicit render
    assert.equal($container2.children().length, 1, 'The container2 already contains an element');
    assert.equal($container2.children().get(0), $dummy2.get(0), 'The container2 contains the dummy element');
    assert.equal($container2.find('.dummy').length, 1, 'The container2 contains an element of the class dummy');

    instance = componentFactory().init();
    instance.render($container2);

    assert.equal($container2.find('.dummy').length, 1, 'The container2 contains an element of the class dummy');
    assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
    assert.equal(typeof instance.getElement(), 'object', 'The component instance returns the rendered content as an object');
    assert.equal(instance.getElement().length, 1, 'The component instance returns the rendered content');
    assert.equal(instance.getElement().parent().get(0), $container2.get(0), 'The component instance is rendered inside the right container');

    instance.destroy();

    assert.equal($container2.children().length, 1, 'The component has beend removed from the container2');
    assert.equal($container2.find('.dummy').length, 1, 'The container2 contains an element of the class dummy');
    assert.equal(instance.getElement(), null, 'The component instance has removed its rendered content');

    instance = componentFactory().init();
    instance.setTemplate(template);

    assert.equal(typeof instance.getTemplate(), 'function', 'The template used to render the component is a function');
    assert.equal((instance.getTemplate())(), template, 'The built template is the same as the provided one');

    instance.render($container3);

    assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
    assert.equal(typeof instance.getElement(), 'object', 'The component instance returns the rendered content as an object');
    assert.equal(instance.getElement().length, 1, 'The component instance returns the rendered content');
    assert.equal(instance.getElement().parent().get(0), $container3.get(0), 'The component instance is rendered inside the right container');
    assert.equal($container3.html(), renderedTemplate, 'The component instance has rendered the right content');

    instance.destroy();

    assert.equal($container3.children().length, 0, 'The container1 is now empty');
    assert.equal(instance.getElement(), null, 'The component instance has removed its rendered content');
});


QUnit.test('setSize', function (assert) {
    const $dummy1 = $('<div class="dummy" />');
    const $dummy2 = $('<div class="dummy" />');
    const template = '<div class="my-component">TEST</div>';
    const renderedTemplate = '<div class="my-component rendered">TEST</div>';
    const $container1 = $('#fixture-1').append($dummy1);
    const $container2 = $('#fixture-2').append($dummy2);
    const $container3 = $('#fixture-3');
    let expectedWidth = 200;
    let expectedHeight = 100;

    assert.expect(42);

    // auto render at init
    assert.equal($container1.children().length, 1, 'The container1 already contains an element');
    assert.equal($container1.children().get(0), $dummy1.get(0), 'The container1 contains the dummy element');
    assert.equal($container1.find('.dummy').length, 1, 'The container1 contains an element of the class dummy');

    let instance = componentFactory().init({
        renderTo: $container1,
        replace: true,
        width: expectedWidth,
        height: expectedHeight
    });

    assert.equal($container1.find('.dummy').length, 0, 'The container1 does not contain an element of the class dummy');
    assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
    assert.equal(typeof instance.getElement(), 'object', 'The component instance returns the rendered content as an object');
    assert.equal(instance.getElement().length, 1, 'The component instance returns the rendered content');
    assert.equal(instance.getElement().parent().get(0), $container1.get(0), 'The component instance is rendered inside the right container');

    assert.equal(instance.getElement().width(), expectedWidth, 'The expected width has been set');
    assert.equal(instance.getElement().height(), expectedHeight, 'The expected height has been set');

    let getSizeResult = instance.getSize();
    assert.equal(getSizeResult.width, expectedWidth, '.getSize() returns the expected width');
    assert.equal(getSizeResult.height, expectedHeight, '.getSize() returns the expected height');

    instance.destroy();

    assert.equal($container1.children().length, 0, 'The container1 is now empty');
    assert.equal(instance.getElement(), null, 'The component instance has removed its rendered content');

    // explicit render
    assert.equal($container2.children().length, 1, 'The container2 already contains an element');
    assert.equal($container2.children().get(0), $dummy2.get(0), 'The container2 contains the dummy element');
    assert.equal($container2.find('.dummy').length, 1, 'The container2 contains an element of the class dummy');

    expectedWidth = 250;
    expectedHeight = 150;
    $container2.width(expectedWidth);
    $container2.height(expectedHeight);

    instance = componentFactory().init({
        width: 'auto',
        height: 'auto'
    });
    instance.render($container2);

    assert.equal($container2.find('.dummy').length, 1, 'The container2 contains an element of the class dummy');
    assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
    assert.equal(typeof instance.getElement(), 'object', 'The component instance returns the rendered content as an object');
    assert.equal(instance.getElement().length, 1, 'The component instance returns the rendered content');
    assert.equal(instance.getElement().parent().get(0), $container2.get(0), 'The component instance is rendered inside the right container');

    assert.equal(instance.getElement().width(), expectedWidth, 'The expected width has been set');
    assert.equal(instance.getElement().height(), expectedHeight, 'The expected height has been set');

    getSizeResult = instance.getSize();
    assert.equal(getSizeResult.width, expectedWidth, '.getSize() returns the expected width');
    assert.equal(getSizeResult.height, expectedHeight, '.getSize() returns the expected height');

    instance.destroy();

    assert.equal($container2.children().length, 1, 'The component has beend removed from the container2');
    assert.equal($container2.find('.dummy').length, 1, 'The container2 contains an element of the class dummy');
    assert.equal(instance.getElement(), null, 'The component instance has removed its rendered content');

    expectedWidth = 200;
    expectedHeight = 100;

    instance = componentFactory().init();
    instance.setTemplate(template);

    assert.equal(typeof instance.getTemplate(), 'function', 'The template used to render the component is a function');
    assert.equal((instance.getTemplate())(), template, 'The built template is the same as the provided one');

    instance.render($container3);

    assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
    assert.equal(typeof instance.getElement(), 'object', 'The component instance returns the rendered content as an object');
    assert.equal(instance.getElement().length, 1, 'The component instance returns the rendered content');
    assert.equal(instance.getElement().parent().get(0), $container3.get(0), 'The component instance is rendered inside the right container');
    assert.equal($container3.html(), renderedTemplate, 'The component instance has rendered the right content');

    instance.setSize(expectedWidth, expectedHeight);
    assert.equal(instance.getElement().width(), expectedWidth, 'The expected width has been set');
    assert.equal(instance.getElement().height(), expectedHeight, 'The expected height has been set');

    getSizeResult = instance.getSize();
    assert.equal(getSizeResult.width, expectedWidth, '.getSize() returns the expected width');
    assert.equal(getSizeResult.height, expectedHeight, '.getSize() returns the expected height');

    instance.destroy();

    assert.equal($container3.children().length, 0, 'The container1 is now empty');
    assert.equal(instance.getElement(), null, 'The component instance has removed its rendered content');
});

QUnit.test('getOuterSize()', function (assert) {
    const cases = [{
        title: 'content-box, no extra size, margin not included',
        boxSizing: 'content-box', width: 100, height: 100, margin: 0, padding: 0, border: 0, includeMargin: false,
        outerWidth: 100, outerHeight: 100
    }, {
        title: 'content-box, with margin, margin not included',
        boxSizing: 'content-box', width: 100, height: 100, margin: 10, padding: 0, border: 0, includeMargin: false,
        outerWidth: 100, outerHeight: 100
    }, {
        title: 'content-box, with margin, margin included',
        boxSizing: 'content-box', width: 100, height: 100, margin: 10, padding: 0, border: 0, includeMargin: true,
        outerWidth: 120, outerHeight: 120
    }, {
        title: 'content-box, with margin/padding, margin included',
        boxSizing: 'content-box', width: 100, height: 100, margin: 10, padding: 10, border: 0, includeMargin: true,
        outerWidth: 140, outerHeight: 140
    }, {
        title: 'content-box, with margin/padding/border, margin included',
        boxSizing: 'content-box', width: 100, height: 100, margin: 10, padding: 10, border: 10, includeMargin: true,
        outerWidth: 160, outerHeight: 160
    }, {
        title: 'border-box, no extra size, margin not included',
        boxSizing: 'border-box', width: 100, height: 100, margin: 0, padding: 0, border: 0, includeMargin: false,
        outerWidth: 100, outerHeight: 100
    }, {
        title: 'border-box, with margin, margin not included',
        boxSizing: 'border-box', width: 100, height: 100, margin: 10, padding: 0, border: 0, includeMargin: false,
        outerWidth: 100, outerHeight: 100
    }, {
        title: 'border-box, with margin, margin included',
        boxSizing: 'border-box', width: 100, height: 100, margin: 10, padding: 0, border: 0, includeMargin: true,
        outerWidth: 120, outerHeight: 120
    }, {
        title: 'border-box, with margin/padding, margin included',
        boxSizing: 'border-box', width: 100, height: 100, margin: 10, padding: 10, border: 0, includeMargin: true,
        outerWidth: 120, outerHeight: 120
    }, {
        title: 'border-box, with margin/padding/border, margin included',
        boxSizing: 'border-box', width: 100, height: 100, margin: 10, padding: 10, border: 10, includeMargin: true,
        outerWidth: 120, outerHeight: 120
    }];

    const done = assert.async();
    let count = cases.length;
    assert.expect(2 * count);

    cases.forEach(data => {
        const template = '<div>TEST</div>';
        const $container1 = $('#fixture-1');

        componentFactory()
            .setTemplate(template)
            .on('render', function () {
                const $component = this.getElement();

                $component.css({
                    'box-sizing': data.boxSizing,
                    'padding': data.padding + 'px',
                    'margin': data.margin + 'px',
                    'border': data.border + 'px solid black'
                });

                let outerSize = this.getOuterSize(data.includeMargin);
                assert.equal(outerSize.width, data.outerWidth, 'getOuterSize() returns the correct width');
                assert.equal(outerSize.height, data.outerHeight, 'getOuterSize() returns the correct height');

                if (--count < 1) {
                    done();
                }
            })
            .init({
                renderTo: $container1,
                replace: true,
                width: data.width,
                height: data.height
            });
    });

});


QUnit.test('show/hide', function (assert) {
    const instance = componentFactory()
        .init()
        .render();

    const $component = instance.getElement();

    assert.expect(8);

    assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
    assert.equal($component.length, 1, 'The component instance returns the rendered content');

    assert.equal(instance.is('hidden'), false, 'The component instance is visible');
    assert.equal(instance.getElement().hasClass('hidden'), false, 'The component instance does not have the hidden class');

    instance.hide();

    assert.equal(instance.is('hidden'), true, 'The component instance is hidden');
    assert.equal(instance.getElement().hasClass('hidden'), true, 'The component instance has the hidden class');

    instance.show();

    assert.equal(instance.is('hidden'), false, 'The component instance is visible');
    assert.equal(instance.getElement().hasClass('hidden'), false, 'The component instance does not have the hidden class');

    instance.destroy();
});


QUnit.test('enable/disable', function (assert) {
    const instance = componentFactory()
        .init()
        .render();
    const $component = instance.getElement();

    assert.expect(8);

    assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
    assert.equal($component.length, 1, 'The component instance returns the rendered content');

    assert.equal(instance.is('disabled'), false, 'The component instance is enabled');
    assert.equal(instance.getElement().hasClass('disabled'), false, 'The component instance does not have the disabled class');

    instance.disable();

    assert.equal(instance.is('disabled'), true, 'The component instance is disabled');
    assert.equal(instance.getElement().hasClass('disabled'), true, 'The component instance has the disabled class');

    instance.enable();

    assert.equal(instance.is('disabled'), false, 'The component instance is enabled');
    assert.equal(instance.getElement().hasClass('disabled'), false, 'The component instance does not have the disabled class');

    instance.destroy();
});


QUnit.test('state', function (assert) {
    const instance = componentFactory()
        .init()
        .render();
    const $component = instance.getElement();

    assert.expect(8);

    assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
    assert.equal($component.length, 1, 'The component instance returns the rendered content');

    assert.equal(instance.is('customState'), false, 'The component instance does not have the customState state');
    assert.equal(instance.getElement().hasClass('customState'), false, 'The component instance does not have the customState class');

    instance.setState('customState', true);

    assert.equal(instance.is('customState'), true, 'The component instance has the customState state');
    assert.equal(instance.getElement().hasClass('customState'), true, 'The component instance has the customState class');

    instance.setState('customState', false);

    assert.equal(instance.is('customState'), false, 'The component instance does not have the customState state');
    assert.equal(instance.getElement().hasClass('customState'), false, 'The component instance does not have the customState class');

    instance.destroy();
});


QUnit.test('events', function (assert) {
    const instance = componentFactory();
    const expectedWidth = 200;
    const expectedHeight = 100;
    const done = assert.async();

    assert.expect(7);
    Promise.all([
        new Promise(resolve => {
            instance.on('custom', function () {
                assert.ok(true, 'The component instance can handle custom events');
                resolve();
            });
        }),
        new Promise(resolve => {
            instance.on('init', function () {
                assert.ok(true, 'The component instance triggers event when it is initialized');
                resolve();
            });
        }),
        new Promise(resolve => {
            instance.on('render', function () {
                assert.ok(true, 'The component instance triggers event when it is rendered');
                resolve();
            });
        }),
        new Promise(resolve => {
            instance.on('setsize', function (width, height) {
                assert.ok(true, 'The component instance triggers event when it is resized');
                assert.equal(width, expectedWidth, 'The right width has been provided');
                assert.equal(height, expectedHeight, 'The right height has been provided');
                resolve();
            });
        }),
        new Promise(resolve => {
            instance.on('destroy', function () {
                assert.ok(true, 'The component instance triggers event when it is destroyed');
                resolve();
            });
        })

    ]).catch(err => {
        console.error(err);
        assert.ok(false, 'No error should be thrown');
    }).then(done);

    instance
        .init()
        .render()
        .setSize(expectedWidth, expectedHeight)
        .trigger('custom')
        .destroy();
});

QUnit.test('extends', function (assert) {
    const done = assert.async();
    const expectedValue = 'pouet!';
    const instance = componentFactory({
        yolo: function (val) {
            assert.ok(true, 'The additional method has been called');
            assert.equal(val, expectedValue, 'The expected value has been provided');
            done();
        }
    });

    assert.expect(2);

    instance.yolo(expectedValue);
});

QUnit.test('getConfig', function (assert) {
    const defaults = {
        label: 'default',
        value: 12
    };
    const config = {
        label: 'config',
        init: true
    };

    assert.expect(2);

    let instance = componentFactory({}, defaults);
    assert.deepEqual(instance.getConfig(), defaults, 'The component contains the default config');

    instance.init(config);

    assert.deepEqual(instance.getConfig(), {
        label: 'config',
        init: true,
        value: 12
    }, 'The component contains the init config');
});