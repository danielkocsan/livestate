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


    describe('can bind properties and node elements', function () {
        it('SHOULD update property when dom element changes', function () {
            var mockValue = 'a',
                mockElement = $('<div />');

            SUT.bind('myProp', mockElement);

            mockElement.val(mockValue).trigger('change');

            expect(SUT.get('myProp')).toEqual(mockValue);
        });

        it('SHOULD update dom element when property changes', function () {
            var mockValue = 'a',
                mockElement = $('<div />');

            SUT.bind('myProp', mockElement);

            SUT.set('myProp', mockValue);

            expect(mockElement.val()).toEqual(mockValue);
            expect(SUT.get('myProp')).toEqual(mockValue);
        });
    });

    describe('onChange method', function () {
        it('should call event handler if dom element changes', function () {
            var spy = jasmine.createSpy(),
                testElement = $('<div />');

            SUT.bind('testProp', testElement);
            SUT.onChange('testProp', spy);
            testElement.val('testValue').trigger('change');
            expect(spy).toHaveBeenCalled();
        });
    });
});