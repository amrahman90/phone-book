var persons = [];
var editId;

// TODO edit API url's & ACTION_METHODS
const API = {
    CREATE: "./api/add.json",
    READ: "https://resources-bucket-7276.s3.eu-west-3.amazonaws.com/list.json",
    UPDATE: "./api/update.json",
    DELETE: "./api/delete.json"
};
const ACTION_METHODS = {
    CREATE: "GET",
    READ: "GET",
    UPDATE: "GET",
    DELETE: "GET"
};

const numberLettersMap = new Map([["0", []], ["1", []], ["2", ["a","b","c"]], ["3", ["d","e","f"]], ["4", ["g","h","i"]], 
["5", ["j","k","l"]], ["6", ["m","n","o"]], ["7", ["p","q","r","s"]], ["8", ["t","u","v"]], ["9", ["w","x","y","z"]]]);

window.PhoneBook = {
    getRow: function(person) {
        // ES6 string template
        return `<tr>
            <td>${person.firstName}</td>
            <td>${person.lastName}</td>
            <td>${person.phone}</td>
        </tr>`;
    },

    load: function () {
        fetch(API.READ).then(response => response.json())
        .then(res => {
            PhoneBookLocalActions.load(res);
            PhoneBook.display(res);
        });
    },

    delete: function(id) {
        $.ajax({
            url: API.DELETE,
            method: ACTION_METHODS.DELETE,
            data: {
                id: id
            }
        }).done(function (response) {
            if (response.success) {
                PhoneBookLocalActions.delete(id);
            }
        });
    },

    add: function(person) {
        PhoneBook.cancelEdit();
        PhoneBookLocalActions.add(person);
    },

    update: function(person) {
        $.ajax({
            url: API.UPDATE,
            method: ACTION_METHODS.UPDATE,
            data: person
        }).done(function (response) {
            if (response.success) {
                PhoneBook.cancelEdit();
                PhoneBookLocalActions.update(person);
            }
        });
    },

    bindEvents: function() {
        $('#phone-book tbody').delegate('a.edit', 'click', function () {
            var id = $(this).data('id');
            PhoneBook.startEdit(id);
        });

        $('#phone-book tbody').delegate('a.delete', 'click', function () {
            var id = $(this).data('id');
            console.info('click on ', this, id);
            PhoneBook.delete(id);
        });

        $(".add-form").submit(function() {
            const person = {
                firstName: $('input[name=firstName]').val(),
                lastName: $('input[name=lastName]').val(),
                phone: $('input[name=phone]').val()
            };

            if (editId) {
                person.id = editId;
                PhoneBook.update(person);
            } else {
                PhoneBook.add(person);
            }
        });

        document.getElementById('search').addEventListener('input', function(ev) {
            //const value = document.getElementById('search').value;
            const value = this.value;
            PhoneBook.search(value);
        });
        document.querySelector('.add-form').addEventListener('reset', function(ev) {
            PhoneBook.search("");
        });
    },

    startEdit: function (id) {
        // ES5 function systax inside find
        var editPerson = persons.find(function (person) {
            console.log(person.firstName);
            return person.id == id;
        });
        console.debug('startEdit', editPerson);

        $('input[name=firstName]').val(editPerson.firstName);
        $('input[name=lastName]').val(editPerson.lastName);
        $('input[name=phone]').val(editPerson.phone);
        editId = id;
    },

    cancelEdit: function() {
        editId = '';
        document.querySelector(".add-form").reset();
    },

    display: function(persons) {
        var rows = '';

        // ES6 function systax inside forEach
        persons.forEach(person => rows += PhoneBook.getRow(person));

        $('#phone-book tbody').html(rows);
    },

    search: function (value) {
        value = value.toLowerCase();
        var filtered;

        if(isNaN(value)) {
            filtered = persons.filter(function (person) {
                return person.firstName.toLowerCase().includes(value) ||
                    person.lastName.toLowerCase().includes(value);
            });
        }
        else {
            var charArr = [];
            for(let i=0; i<value.length; i++) {
                var num = value[i];
                var chars = numberLettersMap.get(num);
                charArr.push(chars);
            }
            var combinations = createCombinations(charArr, []);
            filtered = persons.filter(function (person) {
                return combinations.some(val => person.firstName.toLowerCase().includes(val) || 
                    person.lastName.toLowerCase().includes(val)) || person.phone.toLowerCase().includes(value);
            });
        }
    
        PhoneBook.display(filtered);
    }
};

function createCombinations(fields, currentCombinations) {
    var tempFields = fields.slice();

    if (!tempFields || tempFields.length == 0) {
      return currentCombinations;
    }
    else {
      var combinations = [];
      var field = tempFields.pop();
  
      for (var valueIndex = 0; valueIndex < field.length; valueIndex++) {
        var valueName = field[valueIndex];
  
        if (!currentCombinations || currentCombinations.length == 0) {
          var combinationName = valueName;
          combinations.push(combinationName);
        }
        else {
          for (var combinationIndex = 0; combinationIndex < currentCombinations.length; combinationIndex++) {
            var currentCombination = currentCombinations[combinationIndex];
            var combinationName = valueName + currentCombination;
            combinations.push(combinationName);
          }
        }
      }
      return createCombinations(tempFields, combinations);
    }
  }


// ES6 functions
window.PhoneBookLocalActions = {
    load: (persons) => {
        // save in persons as global variable
        window.persons = persons;
    },
    // ES6 functions (one param - no need pharanteses for arguments)
    add: person => {
        person.id = new Date().getTime();
        persons.push(person);
        PhoneBook.display(persons);
    },
    delete: id => {
        var remainingPersons = persons.filter(person => person.id !== id);
        window.persons = remainingPersons;
        PhoneBook.display(remainingPersons);
    },
    update: person => {
        const id = person.id;
        var personToUpdate = persons.find(person => person.id === id);
        personToUpdate.firstName = person.firstName;
        personToUpdate.lastName = person.lastName;
        personToUpdate.phone = person.phone;
        PhoneBook.display(persons);
    }
}

PhoneBook.load();
PhoneBook.bindEvents();