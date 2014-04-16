describe('LiveState object', function () {
    var SUT,
        itHasAMethod = function (methodName) {
            it('has a ' + methodName + '() method', function () {
                expect(SUT[methodName]).toBeDefined();
                expect(typeof SUT[methodName]).toEqual('function');
            });
        };

    beforeEach(function () {
        SUT = dio.di.getCustomInstance('State');
    });

    describe('SHOULD has an interface which', function () {
        itHasAMethod('set');
        itHasAMethod('get');
        itHasAMethod('getDOM');
        itHasAMethod('subscribe');
        itHasAMethod('reset');
        itHasAMethod('bind');
    });

    describe("GIVEN an element's value is set", function () {
        var mockProperty = 'a',
            mockValue = 'test';

        beforeEach(function () {
            SUT.set(mockProperty, mockValue);
        });

        describe("WHEN get method has called with the elementName only THEN", function () {
            it('returns the set value', function () {
                expect(SUT.get(mockProperty)).toEqual(mockValue);
            });
        });

        describe("GIVEN a child element's value is set", function () {
            var childMockProperty = 'a.b',
                childMockValue = 'childElementValue';

            beforeEach(function () {
                SUT.set(childMockProperty, childMockValue);
            });

            describe("WHEN get method has called with the elementName only THEN", function () {
                it('returns the set value', function () {
                    expect(SUT.get(childMockProperty)).toEqual(childMockValue);
                });
            });

            describe("WHEN get method has called with the parent element's name only THEN", function () {
                it('returns the set value', function () {
                    expect(SUT.get(mockProperty)).toEqual(mockValue);
                });
            });
        });
    });


});