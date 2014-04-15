/**
 * EventPublisher tests
 *
 * @author: igor_mucsicska
 */
describe('eventPublisher', function () {
    var ep = dio.di.getCustomInstance('EventPublisher'),
        MODULES = {},
        resolver = function (params) {
            params.deferred.resolve();
        };

    MODULES.ALPHA = 'alphaModule';
    MODULES.BRAVO = 'bravoModule';
    MODULES.CHARLIE = 'charlieModule';

    afterEach(function () {
        ep.reset();
    });

    it('is able to specify subscribing to events by module names', function () {
        var eventName = 'testEvent',
            mySpy = jasmine.createSpy('mySpy').andCallFake(resolver),
            alphaDone = false,
            charlieDone = false,
            allDone = function () {
                expect(mySpy.callCount).toEqual(1);
            };

        ep.subscribe(eventName, MODULES.ALPHA, mySpy);
        ep.publish(eventName, MODULES.ALPHA).done(function () {
            alphaDone = true;
            if (alphaDone && charlieDone) {
                allDone();
            }
        });
        ep.publish(eventName, MODULES.CHARLIE).done(function () {
            charlieDone = true;
            if (alphaDone && charlieDone) {
                allDone();
            }
        });
    });

    it('is able to subscribe to events by event name only', function () {
        var eventName = 'testEvent',
            mySpy = jasmine.createSpy('mySpy').andCallFake(resolver),
            alphaDone = false,
            charlieDone = false,
            allDone = function () {
                expect(mySpy.callCount).toEqual(2);
            };

        ep.subscribe(eventName, null, mySpy);
        ep.publish(eventName, MODULES.ALPHA).done(function () {
            alphaDone = true;
            if (alphaDone && charlieDone) {
                allDone();
            }
        });
        ep.publish(eventName, MODULES.CHARLIE).done(function () {
            charlieDone = true;
            if (alphaDone && charlieDone) {
                allDone();
            }
        });
    });

    it('is able to subscribe to events by module name only', function () {
        var mySpy = jasmine.createSpy('mySpy').andCallFake(resolver);

        ep.subscribe(null, MODULES.ALPHA, mySpy);
        ep.publish('testEvent1', MODULES.ALPHA);
        ep.publish('testEvent2', MODULES.ALPHA).done(function () {
            expect(mySpy.callCount).toEqual(2);
        });
    });

    it('is able to subscribe multiple times to events', function () {
        var done = false,
            eventName = 'testEvent',
            mySpy = jasmine.createSpy('mySpy').andCallFake(resolver);

        ep.subscribe(eventName, null, mySpy);
        ep.subscribe(eventName, null, mySpy);
        ep.subscribe(eventName, null, mySpy);
        runs(function () {
            ep.publish(eventName, MODULES.CHARLIE).done(function () {
                expect(mySpy.callCount).toEqual(3);
                done = true;
            });
        });
        waitsFor(function () {
            return done;
        });
    });

    it('should be asynchronous', function () {
        var done = false,
            eventName = 'testEvent',
            mySpy = jasmine.createSpy('mySpy').andCallFake(resolver);

        ep.subscribe(eventName, MODULES.CHARLIE, mySpy);
        runs(function () {
            ep.publish(eventName, MODULES.CHARLIE).done(function () {
                expect(mySpy).toHaveBeenCalled();
                done = true;
            });
        });
        expect(mySpy).not.toHaveBeenCalled();
        waitsFor(function () {
            return done;
        });
    });

    it('should pass moduleName to event handler', function () {
        var done = false,
            eventName = 'testEventName',
            mySpy = jasmine.createSpy('mySpy').andCallFake(resolver);

        ep.subscribe(eventName, MODULES.CHARLIE, mySpy);
        runs(function () {
            ep.publish(eventName, MODULES.CHARLIE).done(function () {
                expect(mySpy.mostRecentCall.args[0].moduleName).toEqual('charlieModule');
                done = true;
            });
        });
        waitsFor(function () {
            return done;
        });
    });

    it('should pass eventName to event handler', function () {
        var done = false,
            eventName = 'testEventName',
            mySpy = jasmine.createSpy('mySpy').andCallFake(resolver);

        ep.subscribe(eventName, MODULES.CHARLIE, mySpy);
        runs(function () {
            ep.publish(eventName, MODULES.CHARLIE).done(function () {
                expect(mySpy.mostRecentCall.args[0].eventName).toEqual('testEventName');
                done = true;
            });
        });
        waitsFor(function () {
            return done;
        });
    });

    it('should pass data to event handler', function () {
        var done = false,
            eventName = 'testEventName',
            mySpy = jasmine.createSpy('mySpy').andCallFake(resolver),
            testData = {
                success: 'yoyo'
            };

        ep.subscribe(eventName, MODULES.CHARLIE, mySpy);
        runs(function () {
            ep.publish(eventName, MODULES.CHARLIE, testData).done(function () {
                expect(mySpy.mostRecentCall.args[0].data.success).toEqual('yoyo');
                done = true;
            });
        });
        waitsFor(function () {
            return done;
        });
    });

    it('should not call event handlers on unsubscribed modules', function () {
        var eventName = 'testEventName',
            done = false,
            mySpy = jasmine.createSpy('mySpy').andCallFake(resolver);

        ep.subscribe(eventName, MODULES.CHARLIE, mySpy);
        ep.subscribe(eventName, MODULES.CHARLIE, mySpy);
        runs(function () {
            ep.publish(eventName, MODULES.CHARLIE).done(function () {
                ep.unsubscribeAll(eventName, MODULES.CHARLIE);
                ep.publish(eventName, MODULES.CHARLIE).done(function () {
                    expect(mySpy.callCount).toBe(2);
                    done = true;
                });
            });
        });
        waitsFor(function () {
            return done;
        });
    });

    it('should resolve publish promise if no listeners have subscribed', function () {
        var eventName = 'deferredNoHandlerTest';

        ep.publish(eventName, MODULES.ALPHA).done(function () {
            expect(true).toBe(true);
        });
    });

    describe('unsubscribe method', function () {
        it('should remove only the passed handler', function () {
            var done = false,
                eventName = 'testEventName',
                mySpy1 = jasmine.createSpy().andCallFake(resolver),
                mySpy2 = jasmine.createSpy().andCallFake(resolver);

            ep.subscribe(eventName, MODULES.CHARLIE, mySpy1);
            ep.subscribe(eventName, MODULES.CHARLIE, mySpy2);
            ep.unsubscribe(eventName, MODULES.CHARLIE, mySpy1);
            runs(function () {
                ep.publish(eventName, MODULES.CHARLIE).done(function () {
                    expect(mySpy1.callCount).toEqual(0);
                    expect(mySpy2.callCount).toEqual(1);
                    done = true;
                });
            });
            waitsFor(function () {
                return done;
            });
        });
    });
});