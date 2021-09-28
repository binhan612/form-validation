function Validator(formSelector) {
  // Lấy form-group element
  function getParent (element, selector) {
    while(element.parentElement) {
      if(element.parentElement.matches(selector)) {
        return element.parentElement;
      };
      element = element.parentElement;
    }
  };

  var formRules = {
    // fulName: 'required',
    // email: 'required|email',
    // password: 'required|password'
  };

  var validatorRules = {
    required: function (value) {
      return value ? undefined : 'Vui lòng nhập trường này';
    },
    email: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : 'Trường này phải là email.';
    },
    min: function (min) {
      return function (value) {
        return value.length >= min? undefined : `Vui lòng nhập ít nhất ${min} kí tự`;
      };
    },
    max: function (max) {
      return function (value) {
        return value.length <= max? undefined : `Vui lòng nhập tối đa ${min} kí tự`;
      };
    },
    isConfirmed: (value) => {
      return value === formElement.querySelector("#password").value
        ? undefined
        : "Trường này không trùng khớp";
    },
  };


  // Lấy ra element  trong DOM theo `formSelector`
  var formElement = document.querySelector(formSelector);

  // Chỉ xử lý khi có element trong DOM
  if(formElement) {
    var inputs = formElement.querySelectorAll('[name][rules]');

    for (var input of inputs) {
      
      var rules = input.getAttribute('rules').split('|');
      for (var rule of rules) {

        var ruleInfo;
        var isRuleHasValue = rule.includes(':');

        if (isRuleHasValue) {
          ruleInfo = rule.split(':')
          rule = ruleInfo[0];
        };

        var ruleFunc = validatorRules[rule];

        if (isRuleHasValue) {
          ruleFunc = ruleFunc(ruleInfo[1]);
        };

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        };
      };
      // Lắng nghe các sự kiện của input như blur, change, ...
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    };

    // Hàm render message lỗi
    function handleValidate (event) {
      var rules = formRules[event.target.name];
      var errorMessage;
      for (var rule of rules){ 
        errorMessage = rule(event.target.value);
        if (errorMessage) break;
      };
      if (errorMessage) {
        var formGroup = getParent(event.target, '.form-group');
        /** var formGroup = event.target.closest('.form-group'); */
        if (formGroup) {
          formGroup.classList.add('invalid');
          var formMessage = formGroup.querySelector('.form-message');
          if (formMessage) {
            formMessage.innerHTML = errorMessage;
          };
        };
      };
      return !errorMessage;
    };
    // Hàm clear message lỗi
    function handleClearError (event) {
      var formGroup = getParent(event.target, '.form-group');
        /** var formGroup = event.target.closest('.form-group'); */
      if (formGroup.classList.contains('invalid')) {
        formGroup.classList.remove('invalid');
        var formMessage = formGroup.querySelector('.form-message');
          if (formMessage) {
            formMessage.innerHTML = '';
          };
      }
    };
  };

  // Xử lý hành vi submit form 
  formElement.onsubmit = (event) => {
    event.preventDefault();
    var inputs = formElement.querySelectorAll('[name][rules]');
    var isValid = true;
    for (var input of inputs) {
      if (!handleValidate ( { target: input} )) {
        isValid = false;
      };
    };
    if(isValid) {
      if (typeof this.onSubmit === 'function') {
        const enableInput = formElement.querySelectorAll('[name]:not([disabled])');
        const formValues = Array.from(enableInput).reduce(function (values, input) {
          switch (input.type) {
            case 'radio':
              values[input.name] = formElement.querySelector('input[name = "' + input.name + '"]');
              break;
            case 'checkbox':
              if (input.matches(':checked')) {
                if (!Array.isArray(values[input.name])) {
                    values[input.name] = [];
                };
                values[input.name].push(input.value);
              } else if (!values[input.name]){
                values[input.name] = '';
              };
              break;
            case 'file':
              values[input.name] = input.files;
              break;
            default:
              values[input.name] = input.value;
          };
          return values;
        }, {});
        this.onSubmit(formValues);
      } else { 
        formElement.submit();
      };
    };  
  };
};