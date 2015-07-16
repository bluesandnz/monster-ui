# [monster][monster].sub()

* [Syntax](#syntax)
* [Parameters](#parameters)
* [Description](#description)
* [Examples](#examples)

### Syntax
```javascript
monster.sub(topic, callback[, context]);
```

### Parameters
* `topic` (mandatory)

 Type: [String][string_literal]

 _description_

* `callback` (mandatory)

 Type: [Function][function]

 _description_

* `context` (optional)

 Type: [Object][object_literal]

 Default: `this`

 Object which should be used as the "this" context when the callback is invoked.

### Description

### Examples
* Example 1
```javascript
monster.sub('myaccount.hide', function() {
    
});
```
* Example 2
```javascript
var app = {
    subscribe: {
        'myaccount.hide': '_hide'
    },

    _hide: function() {
        var self = this,
            myAccountContainer = $('myaccount');

        if (myAccountContainer.hasClass('myaccount-open')) {
            self.hide(myAccountContainer);
        }
    }
};
```

[monster]: ../../monster.md

[string_literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#String_literals
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
[object_literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#Object_literals