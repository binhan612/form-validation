const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Đối tượng Validator - constructor function
function Validator (options) {
  const formElement = $(options.form);
  const selectorRules = {};
  /**  selectorRules = {
       selector: rules 
      }; */


  // Tìm element ngoài có selector tưng ứng
  function getParent (element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      };
      element = element.parentElement;
    }
  };


  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    const formGroupElement = getParent (inputElement, options.formGroupSelector) || 
      inputElement.closest(options.formGroupSelector);
    const errorElement = formGroupElement.querySelector(
      options.errorSelector
      );
    let errorMessage;

    // Lấy ra các rules của selector
    const rules = selectorRules[rule.selector];
    // Lặp qua từng rule để kiểm tra
    for (var i = 0; i < rules.length; i++) {
      switch(inputElement.type) {
        case 'radio':
        case 'checkbox':
          errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked')) 
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      };
      if (errorMessage) break;
    };

    if (errorMessage) {
      errorElement.innerHTML = errorMessage;
      formGroupElement.classList.add('invalid');
    } else {
      errorElement.innerHTML = '';
      formGroupElement.classList.remove('invalid');
    };

    return !errorMessage;
  };


  // Lấy element của form cần validate
  if(formElement) {

    // Khi submit form
    formElement.onsubmit = function(e) {
      e.preventDefault();
      let isFormValid = true;
      // Lặp qua từng rule và validate 
      options.rules.forEach(function (rule) {
        const inputElement = formElement.querySelector(rule.selector);
        let isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
          } 
        }); 
        
      if (isFormValid) {
        // Trường hợp submit với javascript
        if (typeof options.onSubmit === 'function') {
          const enableInput = formElement.querySelectorAll('[name]:not([disabled])');
          const formValues = Array.from(enableInput).reduce(function (values, input) {
            switch (input.type) {
              case 'radio':
                values[input.name] = formElement.querySelector('input[name = "' + input.name + '"]');
                // if (input.matches(':checked')) {
                //   values[input.name] = input.value;
                // } else if (!values[input.name]) {
                //     values[input.name] = '';
                // }
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
          options.onSubmit(formValues);
        } 
        // Trường hợp submit với hành vi mặc định của trình duyệt
        else {
          formElement.submit();
        };
        
      };
    };


    // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
    options.rules.forEach(function (rule) {
      // Lưu các rules của mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      };
      console.log(rule.selector)
      const inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach (function (inputElement) {
        if(inputElement) {
          // Xử lý bur khỏi input
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };
          // Xử lý mỗi khi người dùng nhập vào input
          inputElement.oninput = function () {
            const formGroupElement = getParent(inputElement, options.formGroupSelector);
            const errorElement = formGroupElement.querySelector(
              options.errorSelector
              );
            errorElement.innerHTML = '';
            formGroupElement.classList.remove('invalid');
          };
        }
      }) 
    });
    console.log(formElement)
  };
};


// Định nghĩa các rules
// Nguyên tắc của các rules
// 1. Khi có lỗi => trả ra message lỗi
// 2. Khi hợp lệ => ko trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      if (selector.includes('#')) {
        return value.trim() ? undefined : message || 'Vui lòng nhập thông tin vào đây.';
      }
      return value ? undefined : message || 'Vui lòng nhập thông tin vào đây.';
    }
  };
}
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : message || 'Trường này phải là email.';
    }
  };
}
Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
        return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự.`;
    }   
  };
}
Validator.isConfirmed = function (selector, getConfirmedValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmedValue() ? undefined : message || 'Giá trị nhập vào không chính xác.'
    }
  };
}