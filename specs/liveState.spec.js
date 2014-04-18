describe('LiveState object', function () {
    var SUT,
        itHasAMethod = function (methodName) {
            it('has a ' + methodName + '() method', function () {
                expect(SUT[methodName]).toBeDefined();
                expect(typeof SUT[methodName]).toEqual('function');
            });
        },
        triggerEvent = function (domNode, eventType) {
            var mockEvent = document.createEvent('Event');

            mockEvent.initEvent(eventType, true, true);
            domNode.dispatchEvent(mockEvent);

            return mockEvent;
        },
        testDomNodeBind = function (mockDomNode, actionFunction) {
            describe('GIVEN a input text DOM Node element is binded by "change" event to an observable element', function () {
                var mockPath = 'a.b.c';

                beforeEach(function () {
                    SUT.bind(mockPath, mockDomNode, ['change']);
                });

                describe('AND there is a subscription to "change" on an element', function () {
                    var handlerSpy;

                    beforeEach(function () {
                        handlerSpy = jasmine.createSpy('handlerSpy');
                        SUT.subscribe(mockPath, 'change', handlerSpy);
                    });

                    describe('WHEN the DOM elements value has changed ', function () {
                        var actionResult;

                        beforeEach(function () {
                            actionResult = actionFunction(mockDomNode);
                        });

                        it('THEN the propertys value should be changed', function () {
                            expect(SUT.get(mockPath)).toEqual(actionResult.value);
                        });

                        it('THEN the handler function should be called with parametes containing the dom event', function () {
                            var params;

                            expect(handlerSpy).toHaveBeenCalled();
                            expect(handlerSpy.calls.length).toEqual(1);

                            expect(handlerSpy.calls[0].args.length).toEqual(1);

                            params = handlerSpy.calls[0].args[0];

                            expect(params.domEventName).toBeDefined();
                            expect(params.domEventName).toEqual('change');

                            expect(params.domEvent).toBeDefined();
                            expect(params.domEvent).toEqual(actionResult.event);
                        });
                    });
                });
            });
        };

    beforeEach(function () {
        SUT = di.getCustomInstance('State');
        SUT.reset();
    });

    describe('SHOULD has an interface which', function () {
        itHasAMethod('set');
        itHasAMethod('get');
        itHasAMethod('getDOM');
        itHasAMethod('subscribe');
        itHasAMethod('reset');
        itHasAMethod('bind');
        itHasAMethod('getChildren');
        itHasAMethod('extend');
    });

    describe('GIVEN an elements value is set', function () {
        var mockPath = 'a',
            mockValue = 'test';

        beforeEach(function () {
            SUT.set(mockPath, mockValue);
        });

        describe('WHEN get method has called with the elementName only', function () {
            it('THEN it returns the set value', function () {
                expect(SUT.get(mockPath)).toEqual(mockValue);
            });
        });

        describe('AND a child elements value is set', function () {
            var childMockProperty = 'a.b',
                childMockValue = 'childElementValue';

            beforeEach(function () {
                SUT.set(childMockProperty, childMockValue);
            });

            describe('WHEN get method has called with the elementName only', function () {
                it('THEN returns the set value', function () {
                    expect(SUT.get(childMockProperty)).toEqual(childMockValue);
                });
            });

            describe('WHEN get method has called with the parent elements name only', function () {
                it(' THEN returns the set value', function () {
                    expect(SUT.get(mockPath)).toEqual(mockValue);
                });
            });

            describe('WHEN getChildren() has called', function () {
                it('THEN it returns an array of strings of the next level children', function () {
                    var expectedValue = ['b'];

                    expect(SUT.getChildren('a')).toEqual(expectedValue);
                });
            });

            describe('WHEN we call extend() with a path and an object', function () {
                var mockPath = 'a.b',
                    mockExtendObject = {
                        value: 'rootValue',
                        attrs: {
                            'rootAtribute': 'rootAtributeValue'
                        },
                        children: {
                            'c': {
                                value: 'nodeValue',
                                attrs: {
                                    'nodeAtribute': 'nodeAtributeValue'
                                }
                            }
                        }
                    };

                beforeEach(function () {
                    SUT.extend(mockPath, mockExtendObject);
                });
                describe('AND get is called on extended path', function () {

                    var value;

                    beforeEach(function () {
                        value = SUT.get('a.b.c');
                    });

                    it('THEN it returns the set value', function () {
                        expect(value).toEqual('nodeValue');
                    });
                });

                describe('AND get is called on a merged path', function () {

                    var value;

                    beforeEach(function () {
                        value = SUT.get('a.b');
                    });

                    it('THEN it returns the set value', function () {
                        expect(value).toEqual('rootValue');
                    });
                });

            });
        });
        
        describe('WHEN reset method has called', function () {
            beforeEach(function () {
                SUT.reset();
            });
            
            it('THEN it returns the set value', function () {
                expect(SUT.get(mockPath)).toBeUndefined();
            });
        });
    });
    
    
    describe('GIVEN an elements attributes are set', function () {
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
        
        describe('WHEN get method has called with the elementName and the attribure name', function () {
            it('THEN it returns the set value', function () {
                expect(SUT.get(mockPath, 'alpha')).toEqual(mockAttributes.alpha);
                expect(SUT.get(mockPath, 'bravo')).toEqual(mockAttributes.bravo);
                expect(SUT.get(mockPath, 'charlie')).toEqual(mockAttributes.charlie);
            });
        });
        
        describe('WHEN get method has called with the elementName only', function () {
            it('THEN it returns undefined', function () {
                expect(SUT.get(mockPath)).toBeUndefined();
            });
        });

        describe('WHEN get method has called with the elementName and "*"', function () {
            it('THEN it returns the attributes object', function () {
                expect(SUT.get(mockPath, '*')).toEqual(mockAttributes);
            });
        });
    });

    describe('GIVEN a child element attributes are set', function () {
        var mockPath = 'a.b.c',
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

        describe('WHEN get method has called with the elementName and the attribure name', function () {
            it('THEN it returns the set value', function () {
                expect(SUT.get(mockPath, 'alpha')).toEqual(mockAttributes.alpha);
                expect(SUT.get(mockPath, 'bravo')).toEqual(mockAttributes.bravo);
                expect(SUT.get(mockPath, 'charlie')).toEqual(mockAttributes.charlie);
            });
        });
    });

    describe('GIVEN there is a subscription to "change" on an element', function () {
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
        
        describe('WHEN the propertys value has changed', function () {

            beforeEach(function () {
                SUT.set(mockElement, mockValue);
            });

            it('THEN the handler function should be called with proper parameters', function () {
                var params,
                    expectedParams = {
                        eventName: 'change',
                        elementPath: mockElement,
                        value: mockValue,
                        attrs: {},
                        hasValueChange: true,
                        hasAttributeChange: false,
                        changedAttributeName: undefined
                    };

                expect(handlerSpy).toHaveBeenCalled();
                expect(handlerSpy.calls.length).toEqual(1);
                expect(handlerSpy.calls[0].args.length).toEqual(1);

                params = handlerSpy.calls[0].args[0];

                expect(params.eventName).toBeDefined();
                expect(params.elementPath).toBeDefined();
                expect(params.value).toBeDefined();
                expect(params.attrs).toBeDefined();
                expect(params.hasValueChange).toBeDefined();
                expect(params.hasAttributeChange).toBeDefined();

                expect(params).toEqual(expectedParams);
            });
        });

        describe('WHEN the propertys any attribute changed', function () {

            beforeEach(function () {
                SUT.set(mockElement, mockAttributes.alpha, 'alpha');
            });

            it('THEN the handler function should be called with proper parameters', function () {
                var params,
                    expectedParams = {
                        eventName: 'change',
                        elementPath: mockElement,
                        value: undefined,
                        attrs: mockAttributes,
                        hasValueChange: false,
                        hasAttributeChange: true,
                        changedAttributeName: 'alpha'
                    };

                expect(handlerSpy).toHaveBeenCalled();
                expect(handlerSpy.calls.length).toEqual(1);

                expect(handlerSpy.calls[0].args.length).toEqual(1);

                params = handlerSpy.calls[0].args[0];

                expect(params.eventName).toBeDefined('eventName');
                expect(params.elementPath).toBeDefined('elementPath');
                expect(params.attrs).toBeDefined('attrs');
                expect(params.hasValueChange).toBeDefined('hasValueChange');
                expect(params.hasAttributeChange).toBeDefined('hasAttributeChange');

                expect(params).toEqual(expectedParams);
            });
        });
    });

    describe('GIVEN there is a subscription to "childrenChange" on an element', function () {
        var handlerSpy,
            parentElementPath = 'b',
            childElementPath = 'b.c.d',
            childMockValue = 'test';

        /*
         ,
         chidMockAttributes = {
         alpha: 'alpha'
         }
         */

        beforeEach(function () {
            handlerSpy = jasmine.createSpy('handlerSpy');
            SUT.subscribe(parentElementPath, 'childrenChange', handlerSpy);
        });

        describe('WHEN the child propertys value has changed', function () {
            beforeEach(function () {
                SUT.set(childElementPath, childMockValue);
            });

            it('THEN attached handler on parent element is called with proper parameters', function () {
                expect(handlerSpy).toHaveBeenCalled();
                expect(handlerSpy.calls.length).toEqual(1);
            });
        });
    });

    (function () {
        var mockDomNode = document.createElement('input'),
            actionFunction = function (domNode) {
                var result = {};

                domNode.value = result.value = 'test';
                result.event = triggerEvent(domNode, 'change');

                return result;
            };

        mockDomNode.type = 'text';
        testDomNodeBind(mockDomNode, actionFunction);
    }());

    (function () {
        var mockDomNode = document.createElement('div'),
            actionFunction = function (domNode) {
                var result = {};

                domNode.innerHTML = result.value = 'test';
                result.event = triggerEvent(domNode, 'change');

                return result;
            };

        testDomNodeBind(mockDomNode, actionFunction);
    }());

    describe('GIVEN there is a dom node with set value', function () {

        var domNode = document.createElement('div'),
            mockPath = 'a.b.c.d',
            mockValue = 'nodeTest';

        describe('WHEN we bind it to an element', function () {

            beforeEach(function () {
                domNode.innerHTML = mockValue;
                SUT.set(mockPath, 'prevValue');
                SUT.bind(mockPath, domNode, []);
            });

            it('THEN the propertys value is equal to the dom elements value', function () {
               expect(SUT.get(mockPath)).toEqual(mockValue);
            });
        });
    });


});
