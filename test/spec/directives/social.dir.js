'use strict';

describe('Social directive', function () {
  var $scope,
    $compile,
    $httpBackend,
    _$window_,
    _Utils_,
    socialmessage,
    browserFb;

  function compile (markup, scope) {
    var $el = $compile(markup)(scope);
    scope.$digest();
    return $el;
  };

  beforeEach(module('lunchButtonApp'));

  beforeEach(inject(function ($window, _$rootScope_, _$compile_, _$httpBackend_, metaService) {
    _$window_ = $window;
    $scope = _$rootScope_;
    $scope.description = '';
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;

    var metaData = {
      'image': 'http://mealshaker.com/staticimages/facebook-sharer-image.png',
      'title': 'Mealshaker',
      'description': 'Shake to find a nearby place to eat!',
      'url': 'http://mealshaker.com'
    };
    spyOn(metaService, 'getFacebookMetaTag').andCallFake(function (param) {
      if (param == 'title') {
        return 'Mealshaker - shake it to find a nearby place to eat!';
      }
      return metaData[param];
    });
    spyOn(metaService, 'getTwitterMetaTag').andCallFake(function (param) {
      return metaData[param];
    });
  }));

  describe('in browser env', function () {
    beforeEach(inject(function (Utils) {
      _Utils_ = Utils;
      _$window_.fbAsyncInit = {
        hasRun: true
      };
      _$window_.open = jasmine.createSpy();
      _$window_.FB = browserFb = {
        ui: jasmine.createSpy()
      };
      spyOn(_Utils_, 'isCordova').andCallFake(function () {
        return false;
      });
    }));

    it('should track analytics', inject(function (Analytics) {
      spyOn(Analytics, 'trackEvent'); // .andCallThrough();

      var button = compile('<button facebook-share>f</button>', $scope);
      button.triggerHandler('click');

      expect(Analytics.trackEvent).toHaveBeenCalledWith('interaction', 'share', 'facebook');
      
      Analytics.trackEvent.reset();
      button = compile('<button twitter-share>f</button>', $scope);
      button.triggerHandler('click');

      expect(Analytics.trackEvent).toHaveBeenCalledWith('interaction', 'share', 'twitter');
    }));

    it('should share with FB JS SDK', function () {
      var button = compile('<button facebook-share>f</button>', $scope);
      button.triggerHandler('click');

      expect(browserFb.ui).toHaveBeenCalled();
    });
    it('should open window to share with twitter', function () {
      _$window_.open = jasmine.createSpy();

      var button = compile('<button twitter-share>f</button>', $scope);
      button.triggerHandler('click');

      expect(_$window_.open).toHaveBeenCalled();
    });

    it('should not trim venue name for FB', function () {
      browserFb.ui.reset();
      $scope.venue = {
        name: 'A very Long Venue Place That Should Not Be Trimmed At A Given Point But Needs To Be Long by using Mealshaker'
      };
      var button = compile('<button facebook-share description="venue.name"></button>', $scope);
      button.triggerHandler('click');

      expect(browserFb.ui).toHaveBeenCalled();
      expect(browserFb.ui.argsForCall[0][0].caption).toEqual('Going for a meal at A very Long Venue Place That Should Not Be Trimmed At A Given Point But Needs To Be Long by using Mealshaker by using Mealshaker');
    });

    it('should trim venue name for twitter', function () {
      $scope.venue = {
        name: 'Going for a meal at A very Long Venue Place That Should Not Be Trimmed At A Given Point But Needs To Be Long by using Mealshaker'
      };
      $scope.$digest();
      var button = compile('<button twitter-share description="venue.name"></button>', $scope);
      button.triggerHandler('click');

      expect(_$window_.open).toHaveBeenCalled();
      expect(_$window_.open.argsForCall[0][0]).toBe('https://twitter.com/intent/tweet?url=http%3A%2F%2Fmealshaker.com&via=Mealshaker&text=Going%20for%20a%20meal%20at%20Going%20for%20a%20meal%20at%20A%20very%20Long%20Venue%20Place%20That%20Should%20Not%20Be%20Trimmed%20At%20A...%20by%20using%20%40Mealshaker');

      // check non-spacing correctly
    });
  });

  describe('in cordova iOS', function () {
    // inject cordova env
    beforeEach(inject(function (Utils) {
      _Utils_ = Utils;
      spyOn(_Utils_, 'isCordova').andCallFake(function () {
        return true;
      });
      _$window_.socialmessage = socialmessage = {
        shareTo: jasmine.createSpy()
      };
    }));

    it('should try FB-share with iOS SDK', inject(function () {
      var _injectedSuccessCb,
        _injectedErrorCb;

      // spyOn(socialmessage, 'shareTo')
      socialmessage.shareTo.andCallFake(function (data, successcb, errorcb) {
        _injectedSuccessCb = successcb;
        _injectedErrorCb = errorcb;
      });

      var button = compile('<button facebook-share>f</button>', $scope);
      angular.element(button).triggerHandler('click');

      expect(_Utils_.isCordova).toHaveBeenCalled();
      expect(_$window_.socialmessage.shareTo).toHaveBeenCalledWith({
        text: 'Mealshaker - shake it to find a nearby place to eat!',
        url: 'http://mealshaker.com',
        activityType: 'PostToFacebook'
      }, _injectedSuccessCb, _injectedErrorCb);
    }));

    it('should fallback to FB iOS SDK', inject(function (cordovaShareService) {
      socialmessage.shareTo.andCallFake(function (data, successcb, errorcb) {
        errorcb();
      });
      spyOn(cordovaShareService, 'facebookSdkShare');

      var button = compile('<button facebook-share description="venue.name" class="facebook">f</button>', $scope);
      angular.element(button).triggerHandler('click');

      expect(_Utils_.isCordova).toHaveBeenCalled();
      expect(_$window_.socialmessage.shareTo).toHaveBeenCalled();
      expect(cordovaShareService.facebookSdkShare).toHaveBeenCalledWith({
        text: 'Mealshaker - shake it to find a nearby place to eat!',
        url: 'http://mealshaker.com',
        image: 'http://mealshaker.com/staticimages/facebook-sharer-image.png',
        activityType: 'PostToFacebook'
      });
      cordovaShareService.facebookSdkShare.reset();
      _Utils_.isCordova.reset();
      _$window_.socialmessage.shareTo.reset();

      $scope.venue = {
        name: 'MyBest Place'
      };
      $scope.$digest();

      angular.element(button).triggerHandler('click');

      expect(_Utils_.isCordova).toHaveBeenCalled();
      expect(_$window_.socialmessage.shareTo).toHaveBeenCalled();
      expect(cordovaShareService.facebookSdkShare).toHaveBeenCalledWith({
        text: 'Going for a meal at MyBest Place by using Mealshaker',
        url: 'http://mealshaker.com',
        image: 'http://mealshaker.com/staticimages/facebook-sharer-image.png',
        activityType: 'PostToFacebook'
      });
    }));

    it('should twitter-share with iOS SDK', inject(function () {
      var _injectedSuccessCb,
        _injectedErrorCb;

      socialmessage.shareTo.andCallFake(function (data, successcb, errorcb) {
        _injectedSuccessCb = successcb;
        _injectedErrorCb = errorcb;
      });

      var button = compile('<button twitter-share description="venue.name">f</button>', $scope);
      angular.element(button).triggerHandler('click');

      expect(_Utils_.isCordova).toHaveBeenCalled();
      expect(_$window_.socialmessage.shareTo).toHaveBeenCalledWith({
        text: 'Shake to find a nearby place to eat!',
        url: 'http://mealshaker.com',
        activityType: 'PostToTwitter'
      }, _injectedSuccessCb, _injectedErrorCb);
      _Utils_.isCordova.reset();
      _$window_.socialmessage.shareTo.reset();

      $scope.venue = {
        name: 'MyBest Place'
      };
      $scope.$digest();

      angular.element(button).triggerHandler('click');

      expect(_Utils_.isCordova).toHaveBeenCalled();
      expect(_$window_.socialmessage.shareTo).toHaveBeenCalledWith({
        text: 'Going for a meal at MyBest Place by using @Mealshaker',
        url: 'http://mealshaker.com',
        activityType: 'PostToTwitter'
      }, _injectedSuccessCb, _injectedErrorCb);
    }));
  });
});