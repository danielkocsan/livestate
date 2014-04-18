(function () {
    var State = function () {
        var state = {};

        function createElement (pathElements) {
            return buildTree(pathElements, state);
        }

        function buildTree (elements, treeBrach) {
            var pathElements = elements.slice(0),
                elementName = pathElements.shift();

            if (!treeBrach[elementName]) {
                treeBrach[elementName] = {
                    attrs: {},
                    handlers: {},
                    children: {},
                    domElements: []
                };
            }

            if (pathElements.length > 0) {
                return buildTree(pathElements, treeBrach[elementName].children);
            }

            return treeBrach[elementName];
        }

        function extendTree (pathElements, extendObject) {
            var element = createElement(pathElements);

            element.value = extendObject.value;
            element.attrs = extendObject.attrs;
            if (extendObject.children) {
                Object.keys(extendObject.children).forEach(function (childrenName) {
                    var nextPathElements = pathElements.slice(0);
                    nextPathElements.push(childrenName);
                    extendTree(nextPathElements, extendObject.children[childrenName]);
                });
            }
        }

        function setElementValue(elementPath, value, domEvent) {
            var element = getTreeElement(elementPath.split('.'), state),
                parents;

            element.value = value;
            callHandlerFunction(element, elementPath, 'change', true, undefined, domEvent);
            parents = getParents(elementPath.split('.'));
            filterChildrenChangeHandlers(parents).forEach(function (element) {
                callHandlerFunction(element, elementPath, 'childrenChange', true, undefined, domEvent);
            });
        }

        function filterChildrenChangeHandlers (elements) {
            return elements.filter(function (element) {
                if (element.handlers.childrenChange) {
                    return element;
                }
            });
        }

        function getTreeElement (elements, treeBrach) {
            var pathElements = elements.slice(0),
                elementName = pathElements.shift();

            if (pathElements.length > 0) {
                return getTreeElement(pathElements, treeBrach[elementName].children);
            }

            return treeBrach[elementName];
        }

        function getElementValue (elementPath) {
            var element = getTreeElement(elementPath.split('.'), state),
                result;

            if (element && element.value) {
                result = element.value;
            }

            return result;
        }

        function setElementAttribute(elementPath, attributeName, attributeValue) {
            var element = getTreeElement(elementPath.split('.'), state);

            element.attrs[attributeName] = attributeValue;
            callHandlerFunction(element, elementPath, 'change', false, attributeName);
        }

        function getElementAttribute(elementPath, attributeName) {
            var result,
                element = getTreeElement(elementPath.split('.'), state);

            if (attributeName === '*') {
                result = element.attrs;
            } else {
                result = element.attrs[attributeName];
            }

            return result;
        }

        function emptyState () {
            state = {};
        }

        function addHandlerFunction(elementPath, eventName, handlerFunction) {
            var element = getTreeElement(elementPath.split('.'), state);

            element.handlers[eventName] = handlerFunction;
        }

        function callHandlerFunction(element, elementPath, eventName, isValueChanged, changedAttributeName, domEvent) {
            var params;

            if (element.handlers[eventName]) {
                params = {
                    eventName: eventName,
                    elementPath: elementPath,
                    value: element.value,
                    attrs: element.attrs,
                    hasValueChange: isValueChanged,
                    hasAttributeChange: !isValueChanged,
                    changedAttributeName: changedAttributeName,
                    domEvent: domEvent
                };

                if (domEvent && domEvent.type) {
                    params.domEventName = domEvent.type;
                }

                element.handlers[eventName].call(this, params);
            }
        }

        function getParents (pathElements) {
            var parentPathElements = pathElements.slice(0),
                element,
                parents,
                result = [];

            parentPathElements.pop();
            if (parentPathElements.length > 0) {
                element = getTreeElement(parentPathElements, state);
                parents = getParents(parentPathElements);

                result = [element];
                if (parents.length > 0) {
                    result = result.concat(parents);
                }
            }

            return result;
        }

        function getChildrenArray (elementPath) {
            return Object.keys(state[elementPath].children);
        }

        function syncDomNodeToElement (elementPath, domNode, event) {
            var domNodeValue = getDomNodeValue(domNode);

            setElementValue(elementPath, domNodeValue, event);
        }

        /*
        function setDomNodeValue (domNode) {
            if (domNode.nodeName === 'INPUT' || domNode.nodeName === 'SELECT' || domNode.nodeName === 'TEXTAREA') {
                domNode.value = value;
            } else {
                $(domNode).html(value);
            }
        }
        */

        function getDomNodeValue (domNode) {
            var value;

            if (domNode.nodeName === 'INPUT' || domNode.nodeName === 'SELECT' || domNode.nodeName === 'TEXTAREA') {
                value = domNode.value;
            } else {
                value = domNode.innerHTML;
            }

            return value;
        }

        function bindDomEvent (elementPath, domNode, domEventName) {
            var handlerFunction = syncDomNodeToElement.bind(this, elementPath, domNode);

            domNode.addEventListener(domEventName, handlerFunction, false);
        }

        function bindNodeElement (elementPath, domNode, events) {
            var element = getTreeElement(elementPath.split('.'), state);

            element.domElements.push({
                element: domNode,
                events: events
            });

            syncDomNodeToElement (elementPath, domNode);

            events.forEach(bindDomEvent.bind(this, elementPath, domNode));
        }

        return {
            set: function (elementPath, value, attributeName) {
                createElement(elementPath.split('.'));

                if (attributeName) {
                    setElementAttribute(elementPath, attributeName, value);
                } else {
                    setElementValue(elementPath, value);
                }
            },
            get: function (elementPath, attributeName) {
                var result;

                if (attributeName) {
                    result = getElementAttribute(elementPath, attributeName);
                } else {
                    result = getElementValue(elementPath);
                }

                return result;
            },
            getDOM: function () {
            },
            getChildren: function (elementPath) {
                return getChildrenArray(elementPath);
            },
            subscribe: function (elementPath, eventName, handlerFunction) {
                createElement(elementPath.split('.'));
                addHandlerFunction(elementPath, eventName, handlerFunction);
            },
            reset: function () {
                emptyState();
            },
            bind: function (elementPath, nodeElement, domEvents) {
                createElement(elementPath.split('.'));
                bindNodeElement(elementPath, nodeElement, domEvents);
            },
            extend: function (path, extendObject) {
                extendTree(path.split('.'), extendObject);
            }
        };
    };
    di.register('State', State);
}());