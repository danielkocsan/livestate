/*global $, state, jasmine, describe, it, beforeEach, expect */
describe('State object', function () {
    'use strict';
    var SUT;

    beforeEach(function () {
        SUT = state;
    });

    describe('can be reset', function () {
        it('SHOULD clear all properties after it was called', function () {
            SUT.set('myProp', 'value');
            SUT.reset();
            expect(SUT.get('myProp')).toBeUndefined();
        });
    });


    describe('bind function', function () {
        it('should propagate update of property when dom element changes', function () {
            var mockValue = 'a',
                mockElement = $('<div />');

            SUT.bind('myProp', mockElement);

            mockElement.val(mockValue).trigger('change');

            expect(SUT.get('myProp')).toEqual(mockValue);
        });

        it('should propagate update of property when given dom event occur', function () {
            var mockValue = 'a',
                mockElement = $('<div />'),
                testDOMEvent = 'focusOut';

            SUT.bind('myProp', mockElement, [testDOMEvent]);

            mockElement.val(mockValue).trigger(testDOMEvent);

            expect(SUT.get('myProp')).toEqual(mockValue);
        });

        it('should propagate update of dom element when property changes', function () {
            var mockValue = 'a',
                mockElement = $('<div />');

            SUT.bind('myProp', mockElement);

            SUT.set('myProp', mockValue);

            expect(mockElement.val()).toEqual(mockValue);
            expect(SUT.get('myProp')).toEqual(mockValue);
        });

        it('should sync given app dom elements', function () {
            var testDOM = $('<div><input class="first" /><input class="second" /></div>'),
                testElements = testDOM.find('input'),
                firstTestElement = testDOM.find('.first'),
                secondTestElement = testDOM.find('.second');


            SUT.bind('myProp', testElements, ['focusout']);
            firstTestElement.val('testValue').trigger('keyup');

            expect(secondTestElement.val()).toEqual('testValue');
        });

        it('should append bindings', function () {
            var testElement1 = $('<div />'),
                testElement2 = $('<span />');

            SUT.bind('testProp', testElement1);
            SUT.bind('testProp', testElement2);

            SUT.set('testProp', 'testValue');
            expect(testElement2.val()).toEqual('testValue');
            expect(testElement1.val()).toEqual('testValue');
        });
    });

    describe('subscribe function', function () {
        it('should subscribe event handler on dom element changes', function () {
            var spy = jasmine.createSpy(),
                testElement = $('<div />');

            SUT.bind('testProp', testElement);
            SUT.subscribe('testProp', spy);
            testElement.val('testValue').trigger('change');
            expect(spy).toHaveBeenCalled();
        });

        it('should subscribe event handler on property changes', function () {
            var spy = jasmine.createSpy(),
                testElement = $('<div />');

            SUT.bind('testProp', testElement);
            SUT.subscribe('testProp', spy);
            SUT.set('testProp', 'testValue');
            expect(spy).toHaveBeenCalled();
        });

        it('should subscribe event handler on dom element changes to specific value', function () {
            var spy = jasmine.createSpy(),
                testElement = $('<div />');

            SUT.bind('testProp', testElement);
            SUT.subscribe('testProp', spy, 'specificValue');
            testElement.val('testValue').trigger('change');
            testElement.val('specificValue').trigger('change');
            expect(spy.calls.count()).toEqual(1);
        });

        it('should subscribe event handler on property changes to specific value', function () {
            var spy = jasmine.createSpy(),
                testElement = $('<div />');

            SUT.bind('testProp', testElement);
            SUT.subscribe('testProp', spy, 'specificValue');
            SUT.set('testProp', 'testValue');
            SUT.set('testProp', 'specificValue');
            expect(spy.calls.count()).toEqual(1);
        });

        it('should pass new value to subscribed event handler', function () {
            var spy = jasmine.createSpy(),
                testElement = $('<div />');

            SUT.bind('testProp', testElement);
            SUT.subscribe('testProp', spy);
            testElement.val('testValue').trigger('change');
            expect(spy).toHaveBeenCalledWith('testValue');
        });
    });
});