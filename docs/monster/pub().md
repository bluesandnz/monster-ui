# [monster][monster].pub()

* [Syntax](#syntax)
* [Parameters](#parameters)
* [Description](#description)
* [Examples](#examples)

### Syntax
```javascript
monster.pub(topic[, data]);
```

### Parameters
* `topic` (mandatory)

 Type: [String][string_literal]

 Name of the topic to publish.

* `data` (optional)

 Type: [Object][object_literal] OR [Array][array_literal] OR [String][string_literal] OR [Number][integer]

 Default: `{}`

 Content of the message

### Description

### Examples
* Hide myaccount
```javascript
monster.pub('myaccount.hide');
```
* Change the name of the app displayed in the top bar
```javascript
monster.pub('core.showAppName', 'myaccount');
```

[monster]: ../../monster.md

[string_literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#String_literals
[object_literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#Object_literals
[array_literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#Array_literals
[integer]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#Integers
