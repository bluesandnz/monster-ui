define(function(require){
	var $ = require("jquery"),
		_ = require("underscore"),
		monster = require("monster"),
		toastr = require("toastr");

	var app = {

		name: "auth",

		i18n: [ 'en-US' ],

		requests: {
			'auth.userAuth': {
				url: 'user_auth',
				verb: 'PUT'
			},
			'auth.sharedAuth': {
				url: 'shared_auth',
				verb: 'PUT'
			},
			'auth.pinAuth': {
				url: 'pin_auth',
				verb: 'PUT'
			},
			'auth.getUser': {
				url: 'accounts/{accountId}/users/{userId}',
				verb: 'GET'
			},
			'auth.getAccount': {
				url: 'accounts/{accountId}',
				verb: 'GET'
			}
		},

		subscribe: {
			'auth.authenticate' : '_authenticate',
			'auth.loadAccount' : '_loadAccount',
			'auth.loginClick': '_loginClick',
			'auth.conferenceLogin': '_conferenceLogin',
			'auth.logout': '_logout',
			'auth.initApp' : '_initApp',
			'auth.welcome' : '_login',
		},

		load: function(callback){
			var self = this;

			if(!$.cookie('monster-auth')) {
				monster.pub('auth.welcome');
			}
			else {
				var cookieData = $.parseJSON($.cookie('monster-auth'));

				self.authToken = cookieData.authToken;
				self.accountId = cookieData.accountId;
				self.userId = cookieData.userId;
				self.isReseller = cookieData.isReseller;
				self.installedApps = cookieData.installedApps;

				monster.pub('auth.loadAccount');
			}

			callback && callback(self);
		},

		render: function(container){

		},

		_authenticate: function(loginData) {
			var self = this;

			monster.request({
				resource: 'auth.userAuth',
				data: {
					data: loginData
				},
				success: function (data, status) {
					self.accountId = data.data.account_id;
					self.authToken = data.auth_token;
					self.userId = data.data.owner_id;
					self.isReseller = data.data.is_reseller;
					if("apps" in data.data) {
						self.installedApps = data.data.apps;
					} else {
						self.installedApps = [];
						toastr.error(self.i18n.active().toastrMessages.appListError);
					}

					if($('#remember_me').is(':checked')) {
						var cookieLogin = {
							login: $('#login').val(),
							accountName: loginData.account_name
						};

						$.cookie('monster-login', JSON.stringify(cookieLogin), {expires: 30});
					}
					else{
						$.cookie('monster-login', null);
					}

					var cookieAuth = {
						authToken: self.authToken,
						accountId: self.accountId,
						userId: self.userId,
						isReseller: self.isReseller,
						installedApps: self.installedApps
					};

					$.cookie('monster-auth', JSON.stringify(cookieAuth));

					$('#ws-content').empty();

					monster.pub('auth.loadAccount');
				},
				error: function(error) {
					if(error.status === 400) {
						monster.ui.alert('Invalid credentials, please check that your username and account name are correct.');
					}
					else if($.inArray(error.status, [401, 403]) > -1) {
						monster.ui.alert('Invalid credentials, please check that your password and account name are correct.');
					}
					else if(error.statusText === 'error') {
						monster.ui.alert('Oh no! We are having trouble contacting the server, please try again later...');
					}
					else {
						monster.ui.alert('An error was encountered while attempting to process your request (Error: ' + status + ')');
					}
				}
			});
		},

		_loadAccount: function(args) {
			var self = this;

			monster.parallel({
				account: function(callback) {
					self._getAccount(function(data) {
						callback(null, data.data);
					},
					function(data) {
						callback('error account', data);
					});
				},
				user: function(callback) {
					self._getUser(function(data) {
						callback(null, data.data);
					},
					function(data) {
						callback('error user', data);
					});
				}
			},
			function(err, results) {
				var defaultApp;

				if(err) {
					// If we want to display a warning
					/*	monster.ui.alert('error', self.i18n.active().errorLoadingAccount, function() {
						$.cookie('monster-auth', null);
						window.location.reload();
					});*/

					$.cookie('monster-auth', null);
					window.location.reload();
				}
				else {
					results.user.account_name = results.account.name;
					results.user.apps = results.user.apps || {};

					self.currentUser = results.user;
					// This account will remain unchanged, it should be used by non-masqueradable apps
					self.originalAccount = results.account;
					// This account will be overriden when masquerading, it should be used by masqueradable apps
					self.currentAccount = $.extend(true, {}, self.originalAccount);

					if(results.user.appList && results.user.appList.length > 0) {
						for(var i = 0; i < results.user.appList.length; i++) {
							var appId = results.user.appList[i],
								accountApps = results.account.apps,
								fullAppList = {};

							_.each(self.installedApps, function(val) {
								fullAppList[val.id] = val;
							});

							if(appId in fullAppList && appId in accountApps && (accountApps[appId].all || results.user.id in accountApps[appId].users)) {
								defaultApp = fullAppList[appId].name;
								break;
							}
						}
					}

					monster.pub('core.loadApps', {
						defaultApp: defaultApp
					});
				}
			});
		},

		_login: function() {
			var self = this,
				accountName = '',
				realm = '',
				cookieLogin = $.parseJSON($.cookie('monster-login')) || {},
				templateName = monster.config.appleConference ? 'conferenceLogin' : 'login',
				templateData = {
					label: {
						login: 'Login:'
					},
					username: cookieLogin.login || '',
					requestAccountName: (realm || accountName) ? false : true,
					accountName: cookieLogin.accountName || '',
					rememberMe: cookieLogin.login || cookieLogin.accountName ? true : false,
					showRegister: monster.config.hide_registration || false
				},
				loginHtml = $(monster.template(self, templateName, templateData)),
				content = $('#welcome_page .right_div');

			loginHtml.find('.login-tabs a').click(function(e) {
				e.preventDefault();
				$(this).tab('show');
			});
			content.empty().append(loginHtml);

			content.find(templateData.username !== '' ? '#password' : '#login').focus();

			content.find('.login').on('click', function(event){
				event.preventDefault();

				if($(this).data('login_type') === 'conference') {
					monster.pub('auth.conferenceLogin');
				} else {
					monster.pub('auth.loginClick', {
						realm: realm,
						accountName: accountName
					});
				}
			});
		},

		_logout: function() {
			var self = this;

			monster.ui.confirm(self.i18n.active().confirmLogout, function() {
				$.cookie('monster-auth', null);

				window.location.reload();
			});
		},

		_initApp: function (args) {
			var self = this;

			var restData = {
					data: {
						realm : self.realm,
						accountId : self.accountId,
						shared_token : self.authToken
					}
				},
				success = function(app) {
					app.isMasqueradable = app.isMasqueradable || true;
					app.accountId = app.isMasqueradable && self.currentAccount ? self.currentAccount.id : self.accountId;
					app.userId = self.userId;

                    args.callback && args.callback();
				};

			if(self.apiUrl !== args.app.apiUrl) {
				monster.request({
                    resource: 'auth.sharedAuth',
                    data: restData,
                    success: function (json, xhr) {
						args.app.authToken = json.auth_token;

						success(args.app);
                    }
                });
			}
			else {
				args.app.authToken = this.authToken;

				success(args.app);
			}
		},

		_getAccount: function(success, error) {
			var self = this;

			monster.request({
				resource: 'auth.getAccount',
				data: {
					accountId: self.accountId
				},
				success: function(_data) {
					if(typeof success === 'function') {
						success(_data);
					}
				},
				error: function(err) {
					if(typeof error === 'function') {
						error(err);
					}
				}
			});
		},

		_getUser: function(success, error) {
			var self = this;

			monster.request({
				resource: 'auth.getUser',
				data: {
					accountId: self.accountId,
					userId: self.userId,
				},
				success: function(_data) {
					if(typeof success === 'function') {
						success(_data);
					}
				},
				error: function(err) {
					if(typeof error === 'function') {
						error(err);
					}
				}
			});
		},

		_loginClick: function(data) {
			var self = this,
				loginUsername = $('#login').val(),
				loginPassword = $('#password').val(),
				loginAccountName = $('#account_name').val(),
				hashedCreds = $.md5(loginUsername + ':' + loginPassword),
				loginData = {};

			if(data.realm) {
				loginData.realm = data.realm;
			}
			else if(data.accountName) {
				loginData.account_name = data.accountName;
			}
			else if(loginAccountName) {
				loginData.account_name = loginAccountName;
			}
			else {
				loginData.realm = loginUsername + (typeof monster.config.realm_suffix === 'object' ? monster.config.realm_suffix.login : monster.config.realm_suffix);
			}

			monster.pub('auth.authenticate', _.extend({ credentials: hashedCreds }, loginData));
		},

		_conferenceLogin: function(data) {
			var self = this,
				formData = form2object('user_login_form');

			_.each(formData.update, function(val, key) {
				if(!val) { delete formData.update[key]; }
			});
			monster.request({
				resource: 'auth.pinAuth',
				data: {
					data: formData
				},
				success: function (data, status) {
					self.accountId = data.data.account_id;
					self.authToken = data.auth_token;
					self.userId = null;
					self.isReseller = data.data.is_reseller;

					$('#ws-content').empty();

					monster.apps.load('conferences', function(app) {
						app.userType = 'unregistered';
						app.user = formData;
						app.isModerator = data.data.is_moderator;
						app.conferenceId = data.data.conference_id;
						app.render($('#ws-content'));
					});
				},
				error: function(error) {
					if(error.status === 400) {
						monster.ui.alert('Invalid credentials, please check that your PIN is correct.');
					}
					else if($.inArray(error.status, [401, 403]) > -1) {
						monster.ui.alert('Invalid credentials, please check that your PIN is correct.');
					}
					else if(error.statusText === 'error') {
						monster.ui.alert('Oh no! We are having trouble contacting the server, please try again later...');
					}
					else {
						monster.ui.alert('An error was encountered while attempting to process your request (Error: ' + status + ')');
					}
				}
			});
		}
	}

	return app;
});