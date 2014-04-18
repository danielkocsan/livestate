#LiveState
##What is LiveState?
LiveState is an extended object which stores elements in tree structure. Every element can have any attributes and
any children. Handler function can subscribe to a change of an element and also there is possibility to subscribe to
any children element change. A change can be a value or an attribute change.
Next to these LiveState also provides the possibility to bind dom elements to state elements. It creates two-way binding
between the two so either the dom element or the state element changes the other side value will be updated. Beside these
it is possible the bind multiple dom elements to a state element. The binding event can be set and can be multiple.
So you can bind an input element to a state element and can define to sync them on every blur, onkeyup or change dom event.

##How can I use it?
### liveState.set(elementPath, value, *attributeName);
With this method you can set or update a state element value or attribute; The attribute name parameter is optional.
If you don't set, element's value will be changed. If you define an attribute name, that will be changed or created.

### liveState.get(elementPath, *attributeName);
With this method you can get a state element value or attribute; The attribute name parameter is optional.
If you don't set, element's value will be returned. If you define an attribute name, that's value will be returned.

### liveState.get(elementPath, type, handlerFunction);
With this method you can subscribe to every value or attribute change of a state element. The set handler function will
be called with an object which contains every necessary data.
There are two types of subscription:
- change
The handler function will be called when the element's value or attribute has changed.
- childrenChange
The handler function will be called when the element's any children's value or attribute has changed.

### liveState.bind(elementPath, domNode, [domEvents]);