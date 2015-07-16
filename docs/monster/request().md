# [monster][monster].request()

* [Syntax](#syntax)
* [Parameters](#parameters)
* [Description](#description)
* [Examples](#examples)

### Syntax
```javascript
monster.request(options);
```

### Parameters
* `options` (mandatory)

 Type: [Object][object_literal]

 Set of options

### Description


### Examples
* Delete a device on the provisioner
```javascript
var app = {
    requests: {
        'provisioner.devices.delete': {
            'apiRoot': monster.config.api.provisioner,
            'url': 'devices/{accountId}/{macAddress}',
            'verb': 'DELETE'
        }
    },

    deleteDevice: function(args, callbackSuccess, callbackError) {
        monster.request({
            resource: 'provisioner.devices.delete',
            data: {
                accountId: args.accountId,
                macAddress: args.macAddress
            },
            success: function(data, status) {
                callbackSuccess && callbackSuccess();
            },
            error: function(data, status) {
                callbackError && callbackError();
            }
        });
    }
};
```
* Example 2

[monster]: ../../monster.md

[object_literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#Object_literals