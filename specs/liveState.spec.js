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
        SUT.reset();
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
        var mockPath = 'a',
            mockValue = 'test';

        beforeEach(function () {
            SUT.set(mockPath, mockValue);
        });

        describe("WHEN get method has called with the elementName only", function () {
            it('THEN it returns the set value', function () {
                expect(SUT.get(mockPath)).toEqual(mockValue);
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
                    expect(SUT.get(mockPath)).toEqual(mockValue);
                });
            });
        });
        
        describe("WHEN reset method has called", function () {
            beforeEach(function () {
                SUT.reset();
            });
            
            it('THEN it returns the set value', function () {
                expect(SUT.get(mockPath)).toBeUndefined();
            });
        });
    });
    
    
    describe("GIVEN an element's attributes are set", function () {
        var mockPath = 'a',
            mockAttributes = {
                alpha: 'alpha',
                bravo: 'bravo',
                charlie: 'charlie'
            };

        beforeEach(function () {
            SUT.set(mockPath, mockAttributes.alpha, 'alpha');
            SUT.set(mockPath, mockAttributes.bravo, 'bravo');
            SUT.set(mockPath, mockAttributes.charlie, 'charlie');
        });
        
        describe("WHEN get method has called with the elementName and the attribure name", function () {
            it('THEN it returns the set value', function () {
                expect(SUT.get(mockPath, 'alpha')).toEqual(mockAttributes.alpha);
                expect(SUT.get(mockPath, 'bravo')).toEqual(mockAttributes.bravo);
                expect(SUT.get(mockPath, 'charlie')).toEqual(mockAttributes.charlie);
            });
        });
        
        describe("WHEN get method has called with the elementName only", function () {
            it('THEN it returns undefined', function () {
                expect(SUT.get(mockPath)).toBeUndefined();
            });
        });

        describe("WHEN get method has called with the elementName and '*'", function () {
            it('THEN it returns the attributes object', function () {
                expect(SUT.get(mockPath, '*')).toEqual(mockAttributes);
            });
        });
    });

    describe("GIVEN there is a subscription to 'change' on an element", function () {
        var handlerSpy,
            mockElement = 'b',
            mockValue = 'test',
            mockAttributes = {
                alpha: 'alpha'
            };
        
        beforeEach(function () {
            handlerSpy = jasmine.createSpy('handlerSpy');
            SUT.subscribe(mockElement, 'change', handlerSpy);
        });
        
        describe("WHEN the property's value has changed", function () {

            beforeEach(function () {
                SUT.set(mockElement, mockValue);
            });

            it('THEN the handler function should be called with proper parameters', function () {
                expect(handlerSpy).toHaveBeenCalled();
                expect(handlerSpy.calls.length).toEqual(1);
                expect(handlerSpy.calls[0].args[0]).toEqual('change');
                expect(handlerSpy.calls[0].args[1]).toEqual(mockElement);
                expect(handlerSpy.calls[0].args[2]).toEqual(mockValue);
                expect(handlerSpy.calls[0].args[3]).toEqual({});
                expect(handlerSpy.calls[0].args[4]).toEqual(true);
                expect(handlerSpy.calls[0].args[5]).toBeUndefined();
            });
        });

        describe("WHEN the property's any attribute changed", function () {

            beforeEach(function () {
                SUT.set(mockElement, mockAttributes.alpha, 'alpha');
            });

            it('THEN the handler function should be called with proper parameters', function () {
                expect(handlerSpy).toHaveBeenCalled();
                expect(handlerSpy.calls.length).toEqual(1);
                expect(handlerSpy.calls[0].args[0]).toEqual('change');
                expect(handlerSpy.calls[0].args[1]).toEqual(mockElement);
                expect(handlerSpy.calls[0].args[2]).toBeUndefined();
                expect(handlerSpy.calls[0].args[3]).toEqual(mockAttributes);
                expect(handlerSpy.calls[0].args[4]).toEqual(false);
                expect(handlerSpy.calls[0].args[5]).toEqual('alpha');
            });
        });
    });
});