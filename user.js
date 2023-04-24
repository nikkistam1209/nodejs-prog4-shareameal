class User {

    constructor(id, firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.street = street;
        this.city = city;
        this.isActive = isActive;
        this.emailAddress = emailAddress;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }

    getId() {
        return this.id;
    }

    getFirstName() {
        return this.firstname;
    }

    getLastName() {
        return this.lastname;
    }

    getStreet() {
        return this.street;
    }

    getCity() {
        return this.city;
    }

    getIsActive() {
        return this.isActive;
    }

    getEmailAddress() {
        return this.emailAddress;
    }

    getPassword() {
        return this.password;
    }

    getPhoneNumber() {
        return this.phoneNumber;
    }
}






module.exports = User;