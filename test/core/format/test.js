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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 */

import format from 'core/format';

QUnit.test('protoype', function(assert) {
    assert.ok(typeof format === 'function', 'Format is a function');
});

QUnit.test('formating', function(assert) {
    assert.equal(format('give me a %s', 'string'), 'give me a string', 'Format with a string replacement');
    assert.equal(
        format('give me two %s %s', 'awesome', 'strings'),
        'give me two awesome strings',
        'Format with 2 string replacements'
    );

    assert.equal(format('give me an %d', 11), 'give me an 11', 'Format with 1 an int');
    assert.equal(format('give me an %d', '11'), 'give me an 11', 'Format with 1 an string as number');
    assert.equal(format('give me an %d', 11.5), 'give me an 11.5', 'Format with 1 a float');
    assert.equal(format('give me an %d', '11.5'), 'give me an 11.5', 'Format with a float in a string');
    assert.equal(format('give me %d%', 100), 'give me 100%', 'Format with percent edge case');

    assert.equal(format('give me a %j', 100), 'give me a 100', 'Format with a json number');
    assert.equal(format('give me a %j', 'kiss'), 'give me a kiss', 'Format with a json string');
    assert.equal(format('give me an %j', ['A', 'rr', 'ay']), 'give me an [A,rr,ay]', 'Format with a json array');
    assert.equal(
        format('give me %j', { a: 1, b: true, c: null, d: 'test' }),
        'give me {a:1,b:true,c:null,d:test}',
        'Format with a json object'
    );
});
