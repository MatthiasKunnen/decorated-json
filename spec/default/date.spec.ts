import test from 'ava';

import {DecoratedJson, jsonObject, jsonProperty} from '../../src';
import {getDiagnostic} from '../../src/diagnostics';

const decoratedJson = new DecoratedJson();

test('Quoted date value should parse', t => {
    t.deepEqual(decoratedJson.type(Date).parse('1543915254'), new Date(1543915254));
    t.deepEqual(decoratedJson.type(Date).parse('-1543915254'), new Date(-1543915254));
    t.deepEqual(decoratedJson.type(Date).parse('"1970-01-18T20:51:55.254Z"'), new Date(1543915254));
});

test('Quoted date value should convert to JSON', t => {
    t.is(
        decoratedJson.type(Date).stringify(new Date(1543915254)),
        `"${new Date(1543915254).toISOString()}"`,
    );
    t.is(
        decoratedJson.type(Date).stringify(new Date(-1543915254)),
        `"${new Date(-1543915254).toISOString()}"`,
    );
    t.is(
        decoratedJson.type(Date).stringify(new Date('2018-12-04T09:20:54')),
        `"${new Date('2018-12-04T09:20:54').toISOString()}"`,
    );
});

test('Unquoted date should convert from JSON', t => {
    t.deepEqual(decoratedJson.type(Date).parse(1543915254), new Date(1543915254));
});

test('Unquoted date should convert to JSON', t => {
    const dateMs = new Date(1543915254);
    t.is(decoratedJson.type(Date).toPlainJson(dateMs), dateMs);
    t.true(decoratedJson.type(Date).toPlainJson(dateMs) instanceof Date);
    const dateStr = new Date('2018-12-04T09:20:54');
    t.is(decoratedJson.type(Date).toPlainJson(dateStr), dateStr);
});

@jsonObject()
class DateSpec {

    @jsonProperty(() => Date)
    date?: Date | null;
}

const timestamp2000 = 946684800000;
const iso2000 = 946684800000;
const date2000 = new Date(timestamp2000);

test('Parsing a date with a date as source value should keep the source value', t => {
    const date = new Date();
    t.is(decoratedJson.type(DateSpec).parse({date: date}).date, date);
});

test('Parsing a date with null as source value should result in null', t => {
    t.is(decoratedJson.type(DateSpec).parse({date: null}).date, null);
});

test.failing('Parsing a date with undefined as source value should result in undefined', t => {
    t.is(decoratedJson.type(DateSpec).parse({date: undefined}).date, undefined);
});

test('Parsing a date with a timestamp as source value should succeed', t => {
    t.deepEqual(decoratedJson.type(DateSpec).parse({date: timestamp2000}).date, date2000);
});

test('Parsing a date with a decimal as source value should error', t => {
    t.throws(() => decoratedJson.type(DateSpec).parse({date: 500000.555}).date, {
        message: getDiagnostic('invalidValueError', {
            path: 'DateSpec.date',
            expectedType: 'a string (ISO-8601) or integer (time since epoch in ms)',
            actualType: 'Float',
        }),
    });
});

test('Parsing a date with a boolean as source value should error', t => {
    t.throws(() => decoratedJson.type(DateSpec).parse({date: true}).date, {
        message: getDiagnostic('invalidValueError', {
            path: 'DateSpec.date',
            expectedType: 'a string (ISO-8601) or integer (time since epoch in ms)',
            actualType: 'Boolean',
        }),
    });
});

test('Parsing a date with a negative timestamp as source value should succeed', t => {
    t.deepEqual(
        decoratedJson.type(DateSpec).parse({date: -timestamp2000}).date,
        new Date(-timestamp2000),
    );
});

test('Parsing a date with an ISO 8601 string as source value should succeed', t => {
    t.deepEqual(decoratedJson.type(DateSpec).parse({date: iso2000}).date, date2000);
});
